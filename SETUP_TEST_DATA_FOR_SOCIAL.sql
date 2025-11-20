-- ============================================================================
-- SETUP TEST DATA FOR SOCIAL FEATURES
-- ============================================================================
-- Run this AFTER you've applied APPLY_SOCIAL_MIGRATION.sql
-- This script will set YOUR current user's wishlist to public
-- ============================================================================

-- STEP 1: Find your user ID (you need to be logged in)
SELECT
  auth.uid() as your_user_id,
  'This is your user ID - you will use it in the next steps' as note;

-- STEP 2: Set YOUR wishlist to public
-- Replace 'YOUR_USER_ID_HERE' with the ID from Step 1
UPDATE profiles
SET wishlist_privacy = 'public'
WHERE id = auth.uid();  -- This updates YOUR logged-in user

-- Verify it worked
SELECT
  id,
  display_name,
  wishlist_privacy,
  follower_count,
  following_count
FROM profiles
WHERE id = auth.uid();

-- STEP 3: Check if you have any wishlisted items
SELECT
  id,
  brand,
  model,
  color,
  status,
  is_archived,
  is_pinned,
  created_at
FROM items
WHERE user_id = auth.uid()
  AND status = 'wishlisted'
  AND is_archived = false
ORDER BY created_at DESC;

-- STEP 4: If you don't have wishlisted items, you need to create some!
-- You can do this via the app:
-- 1. Go to Dashboard → Want to Buy tab
-- 2. Click "Add Item"
-- 3. Fill in the form with status = "Want to Buy"
-- 4. Save the item

-- STEP 5 (Optional): Pin your favorite items (max 5)
-- Replace 'ITEM_ID_HERE' with actual item IDs from Step 3
-- Pinned items appear first on your profile
UPDATE items
SET is_pinned = true
WHERE id = 'ITEM_ID_HERE'  -- Replace with real item ID
  AND user_id = auth.uid()
  AND status = 'wishlisted';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify everything is set up correctly
SELECT
  '1. Your Profile' as check_category,
  display_name,
  wishlist_privacy,
  follower_count,
  following_count
FROM profiles
WHERE id = auth.uid()

UNION ALL

SELECT
  '2. Your Wishlisted Items' as check_category,
  COUNT(*)::TEXT as display_name,
  'items found' as wishlist_privacy,
  NULL::INTEGER as follower_count,
  NULL::INTEGER as following_count
FROM items
WHERE user_id = auth.uid()
  AND status = 'wishlisted'
  AND is_archived = false;

-- ============================================================================
-- NEXT STEPS
-- ============================================================================
-- If everything looks good:
-- 1. Restart your Next.js development server (npm run dev)
-- 2. Go to http://localhost:3000/explore
-- 3. You should see your profile with your public wishlist!
--
-- To test with multiple users:
-- 1. Create a second account in the app
-- 2. Log in as the second user
-- 3. Run this script again to set THAT user's wishlist to public
-- 4. Add wishlisted items for that user
-- 5. Log out and log back in as first user
-- 6. Go to /explore - you should see the second user's profile
-- ============================================================================
