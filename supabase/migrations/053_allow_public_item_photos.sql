-- Migration 053: Allow viewing item_photos for public and followers-only wishlists
-- Fixes issue where photos weren't showing on shared public wishlist profiles

BEGIN;

-- Add new SELECT policy for public wishlist photos
-- This allows anyone to view photos for items in public wishlists
CREATE POLICY "Allow viewing photos for public wishlists"
ON item_photos
FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1
    FROM items i
    INNER JOIN profiles p ON i.user_id = p.id
    WHERE i.id = item_photos.item_id
      AND i.status = 'wishlisted'
      AND i.is_archived = false
      AND p.wishlist_privacy = 'public'
  )
);

-- Add new SELECT policy for followers-only wishlist photos
-- This allows followers to view photos for items in followers-only wishlists
CREATE POLICY "Allow viewing photos for followers-only wishlists"
ON item_photos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM items i
    INNER JOIN profiles p ON i.user_id = p.id
    WHERE i.id = item_photos.item_id
      AND i.status = 'wishlisted'
      AND i.is_archived = false
      AND p.wishlist_privacy = 'followers_only'
      AND (
        -- User is viewing their own photos
        p.id = auth.uid()
        OR
        -- User is following the profile owner
        EXISTS (
          SELECT 1 FROM followers
          WHERE follower_user_id = auth.uid()
            AND following_user_id = p.id
        )
      )
  )
);

COMMIT;

-- Verify policies
COMMENT ON POLICY "Allow viewing photos for public wishlists" ON item_photos IS
  'Allows anyone (authenticated or anonymous) to view photos for items in public wishlists';

COMMENT ON POLICY "Allow viewing photos for followers-only wishlists" ON item_photos IS
  'Allows followers to view photos for items in followers-only wishlists';
