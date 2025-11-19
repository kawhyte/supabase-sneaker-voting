-- ============================================================================
-- Migration 052: Social Wishlist Sharing (SAFE VERSION)
-- ============================================================================
-- Purpose: Enable Instagram-style social wishlist sharing with discovery
-- Date: 2025-11-19
-- Version: 2.1 (Safe idempotent version with proper constraint handling)
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Add is_pinned column to items table
-- ============================================================================
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_items_is_pinned ON items(is_pinned);

-- ============================================================================
-- STEP 2: Add wishlist_privacy to profiles table
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wishlist_privacy'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN wishlist_privacy TEXT DEFAULT 'private'
        CHECK (wishlist_privacy IN ('private', 'followers_only', 'public'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_wishlist_privacy ON profiles(wishlist_privacy);

-- ============================================================================
-- STEP 3: Create followers table (One-way follow system)
-- ============================================================================
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_user_id, following_user_id)
);

-- Prevent self-following (safe constraint addition)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'no_self_follow' AND conrelid = 'followers'::regclass
  ) THEN
    ALTER TABLE followers
      ADD CONSTRAINT no_self_follow CHECK (follower_user_id != following_user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_followers_follower_user_id ON followers(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_user_id ON followers(following_user_id);

-- ============================================================================
-- STEP 4: Add follower/following counts to profiles (denormalized)
-- ============================================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS follower_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;

-- ============================================================================
-- STEP 5: Create trigger to update follower counts
-- ============================================================================
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET follower_count = follower_count + 1
    WHERE user_id = NEW.following_user_id;

    UPDATE profiles
    SET following_count = following_count + 1
    WHERE user_id = NEW.follower_user_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE user_id = OLD.following_user_id;

    UPDATE profiles
    SET following_count = GREATEST(following_count - 1, 0)
    WHERE user_id = OLD.follower_user_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS followers_count_trigger ON followers;
CREATE TRIGGER followers_count_trigger
  AFTER INSERT OR DELETE ON followers
  FOR EACH ROW
  EXECUTE FUNCTION update_follower_counts();

-- ============================================================================
-- STEP 6: Add following limit constraint (max 100 following)
-- ============================================================================
CREATE OR REPLACE FUNCTION check_following_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_following_count INT;
BEGIN
  SELECT COUNT(*) INTO current_following_count
  FROM followers
  WHERE follower_user_id = NEW.follower_user_id;

  IF current_following_count >= 100 THEN
    RAISE EXCEPTION 'Following limit reached (max 100)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_following_limit ON followers;
CREATE TRIGGER enforce_following_limit
  BEFORE INSERT ON followers
  FOR EACH ROW
  EXECUTE FUNCTION check_following_limit();

-- ============================================================================
-- STEP 7: Enable RLS on followers table
-- ============================================================================
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: RLS Policies for followers table
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their follows" ON followers;
CREATE POLICY "Users can view their follows" ON followers FOR SELECT
  USING (
    auth.uid() = follower_user_id OR
    auth.uid() = following_user_id
  );

DROP POLICY IF EXISTS "Users can follow others" ON followers;
CREATE POLICY "Users can follow others" ON followers FOR INSERT
  WITH CHECK (auth.uid() = follower_user_id);

DROP POLICY IF EXISTS "Users can unfollow" ON followers;
CREATE POLICY "Users can unfollow" ON followers FOR DELETE
  USING (
    auth.uid() = follower_user_id OR
    auth.uid() = following_user_id
  );

-- ============================================================================
-- STEP 9: Update items RLS policies for social visibility
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own and shared items" ON items;
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can view items with social privacy" ON items;

CREATE POLICY "Users can view items with social privacy" ON items FOR SELECT
  USING (
    -- Rule 1: Always see your own items
    auth.uid() = user_id
    OR
    -- Rule 2: Wishlisted items are visible based on owner's privacy settings
    (
      status = 'wishlisted' AND (
        -- Public wishlist: Anyone can see
        user_id IN (
          SELECT user_id
          FROM profiles
          WHERE wishlist_privacy = 'public'
        )
        OR
        -- Followers only: Current user must be a follower
        (
          user_id IN (
            SELECT user_id
            FROM profiles
            WHERE wishlist_privacy = 'followers_only'
          )
          AND
          user_id IN (
            SELECT following_user_id
            FROM followers
            WHERE follower_user_id = auth.uid()
          )
        )
      )
    )
  );

-- ============================================================================
-- STEP 10: Helper function to check if user is following someone
-- ============================================================================
CREATE OR REPLACE FUNCTION is_following(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM followers
    WHERE follower_user_id = auth.uid()
      AND following_user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 11: Helper function to get user's public wishlist
-- ============================================================================
CREATE OR REPLACE FUNCTION get_public_wishlist(target_user_id UUID)
RETURNS TABLE (
  item_id UUID,
  brand TEXT,
  model TEXT,
  color TEXT,
  category TEXT,
  retail_price NUMERIC,
  target_price NUMERIC,
  is_pinned BOOLEAN,
  image_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.brand,
    i.model,
    i.color,
    i.category,
    i.retail_price,
    i.target_price,
    i.is_pinned,
    i.image_url,
    i.created_at
  FROM items i
  JOIN profiles p ON p.user_id = i.user_id
  WHERE i.user_id = target_user_id
    AND i.status = 'wishlisted'
    AND i.is_archived = FALSE
    AND (
      p.wishlist_privacy = 'public'
      OR
      (p.wishlist_privacy = 'followers_only' AND is_following(target_user_id))
    )
  ORDER BY i.is_pinned DESC, i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 12: Add helpful comments
-- ============================================================================
COMMENT ON TABLE followers IS 'Social following system (Twitter-style instant follow)';
COMMENT ON COLUMN profiles.wishlist_privacy IS 'Global wishlist privacy: private, followers_only, or public';
COMMENT ON COLUMN profiles.follower_count IS 'Cached follower count (updated via trigger)';
COMMENT ON COLUMN profiles.following_count IS 'Cached following count (updated via trigger)';
COMMENT ON COLUMN items.is_pinned IS 'Featured items on user profile (max 5 recommended)';
COMMENT ON FUNCTION is_following IS 'Check if current user is following target user';
COMMENT ON FUNCTION get_public_wishlist IS 'Get visible wishlist items for a user based on privacy settings';

-- ============================================================================
-- STEP 13: Backfill existing data (optional)
-- ============================================================================
UPDATE profiles
SET wishlist_privacy = 'private'
WHERE wishlist_privacy IS NULL;

UPDATE profiles
SET follower_count = 0, following_count = 0
WHERE follower_count IS NULL OR following_count IS NULL;

COMMIT;
