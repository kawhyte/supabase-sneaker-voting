-- Migration 054: Add collection_privacy to profiles + RLS policies for owned items
-- Allows users to control who can see their owned sneaker collection (separate from wishlist)

BEGIN;

-- 1. Add collection_privacy column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS collection_privacy TEXT DEFAULT 'private'
    CHECK (collection_privacy IN ('private', 'followers_only', 'public'));

CREATE INDEX IF NOT EXISTS idx_profiles_collection_privacy
  ON profiles(collection_privacy);

UPDATE profiles SET collection_privacy = 'private'
  WHERE collection_privacy IS NULL;

COMMENT ON COLUMN profiles.collection_privacy
  IS 'Global owned-items privacy: private, followers_only, or public';

-- 2. Items RLS — additive policies (existing "Users can view items with social privacy" preserved)
-- The existing policy already keeps owned items private by default.
-- These new policies additively grant SELECT to other users based on collection_privacy.

DROP POLICY IF EXISTS "Public collection items visible to authenticated" ON items;
CREATE POLICY "Public collection items visible to authenticated"
  ON items FOR SELECT TO authenticated
  USING (
    status = 'owned'
    AND is_archived = false
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = items.user_id
        AND p.collection_privacy = 'public'
    )
  );

DROP POLICY IF EXISTS "Followers-only collection items visible to followers" ON items;
CREATE POLICY "Followers-only collection items visible to followers"
  ON items FOR SELECT TO authenticated
  USING (
    status = 'owned'
    AND is_archived = false
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = items.user_id
        AND p.collection_privacy = 'followers_only'
        AND EXISTS (
          SELECT 1 FROM followers f
          WHERE f.follower_user_id = auth.uid()
            AND f.following_user_id = p.id
        )
    )
  );

-- 3. item_photos RLS — mirror migration 053 for owned (collection) items
DROP POLICY IF EXISTS "Allow viewing photos for public collections" ON item_photos;
CREATE POLICY "Allow viewing photos for public collections"
  ON item_photos FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM items i
      INNER JOIN profiles p ON i.user_id = p.id
      WHERE i.id = item_photos.item_id
        AND i.status = 'owned'
        AND i.is_archived = false
        AND p.collection_privacy = 'public'
    )
  );

DROP POLICY IF EXISTS "Allow viewing photos for followers-only collections" ON item_photos;
CREATE POLICY "Allow viewing photos for followers-only collections"
  ON item_photos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM items i
      INNER JOIN profiles p ON i.user_id = p.id
      WHERE i.id = item_photos.item_id
        AND i.status = 'owned'
        AND i.is_archived = false
        AND p.collection_privacy = 'followers_only'
        AND (
          p.id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM followers f
            WHERE f.follower_user_id = auth.uid()
              AND f.following_user_id = p.id
          )
        )
    )
  );

COMMIT;

-- Verification comments
COMMENT ON POLICY "Public collection items visible to authenticated" ON items IS
  'Allows any authenticated user to view owned items from profiles with collection_privacy=public';

COMMENT ON POLICY "Followers-only collection items visible to followers" ON items IS
  'Allows followers to view owned items from profiles with collection_privacy=followers_only';

COMMENT ON POLICY "Allow viewing photos for public collections" ON item_photos IS
  'Allows anyone (authenticated or anonymous) to view photos for owned items in public collections';

COMMENT ON POLICY "Allow viewing photos for followers-only collections" ON item_photos IS
  'Allows followers to view photos for owned items in followers-only collections';
