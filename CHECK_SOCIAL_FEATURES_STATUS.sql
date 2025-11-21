-- ============================================================================
-- SOCIAL FEATURES STATUS CHECK
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor to check your setup
-- ============================================================================

-- 1. CHECK: Does followers table exist?
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'followers')
    THEN '✅ followers table exists'
    ELSE '❌ followers table MISSING - Run APPLY_SOCIAL_MIGRATION.sql'
  END AS status;

-- 2. CHECK: Does profiles table have wishlist_privacy column?
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'wishlist_privacy'
    )
    THEN '✅ profiles.wishlist_privacy column exists'
    ELSE '❌ profiles.wishlist_privacy MISSING - Run APPLY_SOCIAL_MIGRATION.sql'
  END AS status;

-- 3. CHECK: Does profiles table have follower_count column?
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'follower_count'
    )
    THEN '✅ profiles.follower_count column exists'
    ELSE '❌ profiles.follower_count MISSING - Run APPLY_SOCIAL_MIGRATION.sql'
  END AS status;

-- 4. CHECK: Does items table have is_pinned column?
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'items' AND column_name = 'is_pinned'
    )
    THEN '✅ items.is_pinned column exists'
    ELSE '❌ items.is_pinned MISSING - Run APPLY_SOCIAL_MIGRATION.sql'
  END AS status;

-- 5. CHECK: How many users have public wishlists?
SELECT
  COUNT(*) as public_wishlist_users,
  CASE
    WHEN COUNT(*) = 0
    THEN '⚠️ No users have set wishlist_privacy to public yet'
    ELSE '✅ ' || COUNT(*) || ' user(s) have public wishlists'
  END AS status
FROM profiles
WHERE wishlist_privacy = 'public';

-- 6. CHECK: How many wishlisted items exist?
SELECT
  COUNT(*) as wishlisted_items,
  CASE
    WHEN COUNT(*) = 0
    THEN '⚠️ No wishlisted items exist in database'
    ELSE '✅ ' || COUNT(*) || ' wishlisted item(s) exist'
  END AS status
FROM items
WHERE status = 'wishlisted' AND is_archived = false;

-- 7. CHECK: Show current privacy settings for all users
SELECT
  id,
  display_name,
  COALESCE(wishlist_privacy, 'NULL - MIGRATION NOT APPLIED') as wishlist_privacy,
  follower_count,
  following_count,
  (SELECT COUNT(*) FROM items WHERE user_id = profiles.id AND status = 'wishlisted' AND is_archived = false) as wishlist_item_count
FROM profiles
ORDER BY display_name;

-- 8. CHECK: Show followers table structure (if it exists)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'followers'
ORDER BY ordinal_position;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Run all queries above. If you see any ❌ or NULL values, you need to:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste the entire contents of APPLY_SOCIAL_MIGRATION.sql
-- 3. Run it
-- 4. Re-run this status check
-- ============================================================================
