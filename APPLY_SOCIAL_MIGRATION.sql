-- ============================================================================
-- SOCIAL FEATURES MIGRATION - SIMPLIFIED FOR MANUAL APPLICATION
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

BEGIN;

-- 1. Add is_pinned column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_items_is_pinned ON items(is_pinned);

-- 2. Add wishlist_privacy to profiles table
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

-- 3. Add follower/following counts to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_follower_count ON profiles(follower_count);
CREATE INDEX IF NOT EXISTS idx_profiles_following_count ON profiles(following_count);

-- 4. Create followers table
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_user_id, following_user_id)
);

-- Prevent self-following
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'no_self_follow'
  ) THEN
    ALTER TABLE followers
      ADD CONSTRAINT no_self_follow
      CHECK (follower_user_id != following_user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_followers_follower_user_id ON followers(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_user_id ON followers(following_user_id);

-- 5. Create helper function: is_following
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

-- 6. Create triggers to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower_count for the user being followed
    UPDATE profiles
    SET follower_count = follower_count + 1
    WHERE id = NEW.following_user_id;

    -- Increment following_count for the user who followed
    UPDATE profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_user_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower_count for the user being unfollowed
    UPDATE profiles
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE id = OLD.following_user_id;

    -- Decrement following_count for the user who unfollowed
    UPDATE profiles
    SET following_count = GREATEST(following_count - 1, 0)
    WHERE id = OLD.follower_user_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_follower_counts_trigger ON followers;

CREATE TRIGGER update_follower_counts_trigger
AFTER INSERT OR DELETE ON followers
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();

-- 7. RLS Policies for followers table
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Allow users to view all follow relationships
DROP POLICY IF EXISTS "Anyone can view follows" ON followers;
CREATE POLICY "Anyone can view follows"
  ON followers FOR SELECT
  USING (true);

-- Allow users to follow others (with limit check in application)
DROP POLICY IF EXISTS "Users can follow others" ON followers;
CREATE POLICY "Users can follow others"
  ON followers FOR INSERT
  WITH CHECK (auth.uid() = follower_user_id);

-- Allow users to unfollow
DROP POLICY IF EXISTS "Users can unfollow" ON followers;
CREATE POLICY "Users can unfollow"
  ON followers FOR DELETE
  USING (auth.uid() = follower_user_id);

COMMIT;
