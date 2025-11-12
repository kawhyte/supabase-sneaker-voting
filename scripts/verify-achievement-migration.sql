-- ============================================================================
-- VERIFY ACHIEVEMENT MIGRATION STATUS
-- ============================================================================
-- Run these queries in Supabase SQL Editor to diagnose the issue
-- ============================================================================

-- Step 1: Check user_achievements column type
-- Expected AFTER migration: "character varying" (VARCHAR)
-- Expected BEFORE migration: "uuid"
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'user_achievements'
  AND column_name = 'achievement_id';

-- Step 2: Check foreign key constraints
-- Should show constraint referencing achievements.achievement_key
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_achievements'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Step 3: Check current achievement definitions
-- Should show 11 achievements with keys like 'wardrobe_starter', 'outfit_creator'
-- If empty or shows 'smart_spender', 'stylist' → migration not applied
SELECT
  achievement_key,
  name,
  category,
  points
FROM achievements
ORDER BY points;

-- Step 4: Count achievements (should be 11 after migration)
SELECT COUNT(*) as achievement_count FROM achievements;

-- Step 5: Check for any existing user_achievements (will be cleared by migration)
SELECT COUNT(*) as user_achievement_count FROM user_achievements;
