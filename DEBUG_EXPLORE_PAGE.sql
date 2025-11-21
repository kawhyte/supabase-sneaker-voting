-- ============================================================================
-- DEBUG SCRIPT: Find out why Explore page is empty
-- ============================================================================
-- Run each query below in Supabase SQL Editor to diagnose the issue
-- ============================================================================

-- ========================================
-- QUERY 1: Check all profiles and their privacy settings
-- ========================================
SELECT
  id,
  display_name,
  email,
  wishlist_privacy,
  follower_count,
  following_count,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Expected: You should see 2 rows with wishlist_privacy = 'public'
-- If wishlist_privacy is NULL → Migration not applied or privacy not saved
-- ========================================

-- ========================================
-- QUERY 2: Check all wishlisted items
-- ========================================
SELECT
  id,
  user_id,
  brand,
  model,
  color,
  status,
  is_archived,
  is_pinned,
  created_at
FROM items
WHERE status = 'wishlisted'
ORDER BY created_at DESC;

-- Expected: You should see multiple items with status = 'wishlisted' and is_archived = false
-- If empty → No wishlist items exist (items might be set to 'owned' instead)
-- ========================================

-- ========================================
-- QUERY 3: Join profiles + items (mimics what the API does)
-- ========================================
SELECT
  p.id as profile_id,
  p.display_name,
  p.wishlist_privacy,
  COUNT(i.id) as wishlist_item_count,
  CASE
    WHEN p.wishlist_privacy IS NULL THEN '❌ wishlist_privacy is NULL - migration not applied'
    WHEN p.wishlist_privacy != 'public' THEN '❌ Privacy is "' || p.wishlist_privacy || '" not "public"'
    WHEN COUNT(i.id) = 0 THEN '❌ No wishlisted items found'
    ELSE '✅ Should appear in Explore'
  END as diagnosis
FROM profiles p
LEFT JOIN items i ON i.user_id = p.id
  AND i.status = 'wishlisted'
  AND i.is_archived = false
GROUP BY p.id, p.display_name, p.wishlist_privacy
ORDER BY p.created_at DESC;

-- This shows exactly what the /api/social/explore endpoint will find
-- If diagnosis shows ❌ → That's your problem!
-- ========================================

-- ========================================
-- QUERY 4: Check profiles.id vs profiles.user_id column
-- ========================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('id', 'user_id');

-- Expected: Should show 'id' column exists (NOT 'user_id')
-- The profiles table primary key should be 'id'
-- ========================================

-- ========================================
-- QUERY 5: Check if items.user_id references profiles correctly
-- ========================================
SELECT
  i.id as item_id,
  i.user_id as item_user_id,
  i.brand,
  i.status,
  p.id as profile_id,
  p.display_name,
  CASE
    WHEN p.id IS NULL THEN '❌ Orphaned item - user_id does not match any profile'
    WHEN p.id = i.user_id THEN '✅ Item correctly linked to profile'
    ELSE '⚠️ Unexpected mismatch'
  END as link_status
FROM items i
LEFT JOIN profiles p ON p.id = i.user_id
WHERE i.status = 'wishlisted'
ORDER BY i.created_at DESC;

-- If you see ❌ Orphaned items → items.user_id doesn't match profiles.id
-- This would cause the API to return empty results
-- ========================================

-- ========================================
-- QUERY 6: Exact simulation of the explore API query
-- ========================================
SELECT
  p.id,
  p.display_name,
  p.email,
  p.wishlist_privacy,
  p.follower_count,
  p.following_count
FROM profiles p
WHERE p.wishlist_privacy = 'public'
ORDER BY p.follower_count DESC;

-- This is EXACTLY what line 46-52 of explore/route.ts does
-- If this returns 0 rows → API will be empty
-- If this returns rows → Problem is in the items query
-- ========================================

-- ========================================
-- QUERY 7: Check if there's a profiles.user_id column that shouldn't exist
-- ========================================
SELECT *
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Look through all columns - there should be 'id' but NOT 'user_id'
-- If you see both 'id' AND 'user_id' → that's a schema issue
-- ========================================

-- ========================================
-- QUERY 8: Manual test - Get items for a specific public user
-- ========================================
-- First, get a user ID with public privacy
WITH public_user AS (
  SELECT id FROM profiles WHERE wishlist_privacy = 'public' LIMIT 1
)
SELECT
  i.id,
  i.user_id,
  i.brand,
  i.model,
  i.status,
  i.is_archived
FROM items i, public_user
WHERE i.user_id = public_user.id
  AND i.status = 'wishlisted'
  AND i.is_archived = false;

-- If this returns items → Data is good, API code has a bug
-- If this returns 0 rows → User has no wishlisted items
-- ========================================

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
-- 1. Run each query above one by one
-- 2. Copy the results here or send them to me
-- 3. Look for ❌ marks in the diagnosis column
-- 4. Pay special attention to:
--    - Query 1: Are both users showing wishlist_privacy = 'public'?
--    - Query 2: Do you see wishlisted items?
--    - Query 3: What does the diagnosis say?
--    - Query 6: Does this return your 2 public users?
-- ============================================================================
