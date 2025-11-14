-- Migration: 049_remove_quiz_gate_and_cooling_off.sql
-- Description: Remove Quiz Gate and Cooling-Off Period features
-- Date: 2025-11-14
--
-- This migration removes all database columns and constraints related to:
-- 1. Quiz Gate ("Can You Style This?" modal)
-- 2. Cooling-Off Period (7/14/30 day purchase locks)
--
-- These features were determined to be over-engineered and added unnecessary
-- friction to the user experience. Duplication Warnings remain enabled.
--
-- Changes:
-- - Drop quiz_gate columns from profiles table (enable_quiz_gate, quiz_gate_outfit_threshold)
-- - Drop cooling-off columns from profiles table (preferred_cooling_off_days)
-- - Drop cooling-off columns from items table (cooling_off_days, can_purchase_after)
-- - Drop cooling-off notification preferences (cooling_off_ready_in_app, _push, _email)
-- - Drop related indexes
--
-- IMPORTANT: This migration is SAFE and REVERSIBLE
-- - Uses DROP COLUMN IF EXISTS to prevent errors if columns don't exist
-- - No data loss occurs (columns are nullable or have defaults)
-- - Application code has been updated to not reference these columns

-- ==================================================
-- STEP 1: Drop Quiz Gate columns from profiles table
-- ==================================================

DROP INDEX IF EXISTS idx_profiles_quiz_gate;

ALTER TABLE profiles
  DROP COLUMN IF EXISTS enable_quiz_gate,
  DROP COLUMN IF EXISTS quiz_gate_outfit_threshold;

COMMENT ON TABLE profiles IS 'User profiles with duplication warning preferences (quiz gate and cooling-off removed in migration 049)';

-- ==================================================
-- STEP 2: Drop Cooling-Off Period columns from profiles table
-- ==================================================

ALTER TABLE profiles
  DROP COLUMN IF EXISTS preferred_cooling_off_days;

-- ==================================================
-- STEP 3: Drop Cooling-Off Period columns from items table
-- ==================================================

DROP INDEX IF EXISTS idx_items_can_purchase_after;

ALTER TABLE items
  DROP COLUMN IF EXISTS cooling_off_days,
  DROP COLUMN IF EXISTS can_purchase_after;

COMMENT ON TABLE items IS 'Wardrobe items with price tracking (cooling-off removed in migration 049)';

-- ==================================================
-- STEP 4: Drop Cooling-Off notification preferences
-- ==================================================

ALTER TABLE notification_preferences
  DROP COLUMN IF EXISTS cooling_off_ready_in_app,
  DROP COLUMN IF EXISTS cooling_off_ready_push,
  DROP COLUMN IF EXISTS cooling_off_ready_email;

COMMENT ON TABLE notification_preferences IS 'User notification preferences (cooling-off notifications removed in migration 049)';

-- ==================================================
-- STEP 5: Clean up orphaned notifications (optional)
-- ==================================================

-- Mark existing cooling_off_ready notifications as read (graceful cleanup)
UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE notification_type = 'cooling_off_ready' AND is_read = false;

COMMENT ON UPDATE IS 'Mark orphaned cooling-off notifications as read (migration 049)';

-- ==================================================
-- Verification Query (for manual testing)
-- ==================================================
-- Run this query after migration to verify columns were dropped:
--
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
--   AND column_name IN ('enable_quiz_gate', 'quiz_gate_outfit_threshold', 'preferred_cooling_off_days');
--
-- Expected result: 0 rows (all columns dropped successfully)
--
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'items'
--   AND column_name IN ('cooling_off_days', 'can_purchase_after');
--
-- Expected result: 0 rows (all columns dropped successfully)
