-- Migration: 051_remove_notification_types.sql
-- Description: Remove Shopping Reminders, Cooling-Off Period, and Quiet Hours notification features
-- Date: 2025-11-14
--
-- This migration removes all database columns related to:
-- 1. Shopping Reminders (gentle reminders to use existing wardrobe)
-- 2. Cooling-Off Period notifications (already partially removed in migration 049)
-- 3. Quiet Hours (timezone-aware notification scheduling)
--
-- These features were determined to be unnecessary complexity for the notification system.
-- Price alerts, wear reminders, seasonal tips, and achievements remain enabled.
--
-- Changes:
-- - Drop shopping_reminders columns (in_app, push, email)
-- - Drop quiet_hours columns (enabled, start, end, user_timezone)
-- - Mark existing shopping_reminder and cooling_off_ready notifications as read
--
-- IMPORTANT: This migration uses DROP COLUMN (not DROP IF EXISTS)
-- - Assumes columns exist (fails fast if schema is inconsistent)
-- - Application code has been updated to not reference these columns

BEGIN;

-- ==================================================
-- STEP 1: Mark existing notifications as read (preserve history)
-- ==================================================

UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE notification_type IN ('shopping_reminder', 'cooling_off_ready')
  AND is_read = false;

-- ==================================================
-- STEP 2: Drop Shopping Reminders notification preferences
-- ==================================================

ALTER TABLE notification_preferences
  DROP COLUMN shopping_reminders_in_app,
  DROP COLUMN shopping_reminders_push,
  DROP COLUMN shopping_reminders_email;

-- ==================================================
-- STEP 3: Drop Quiet Hours columns
-- ==================================================

ALTER TABLE notification_preferences
  DROP COLUMN quiet_hours_enabled,
  DROP COLUMN quiet_hours_start,
  DROP COLUMN quiet_hours_end,
  DROP COLUMN user_timezone;

-- ==================================================
-- STEP 4: Update table comment
-- ==================================================

COMMENT ON TABLE notification_preferences IS 'User notification preferences (shopping reminders, cooling-off, and quiet hours removed in migration 051)';

COMMIT;

-- ==================================================
-- Verification Query (for manual testing)
-- ==================================================
-- Run this query after migration to verify columns were dropped:
--
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'notification_preferences'
--   AND column_name IN (
--     'shopping_reminders_in_app', 'shopping_reminders_push', 'shopping_reminders_email',
--     'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end', 'user_timezone'
--   );
--
-- Expected result: 0 rows (all 7 columns dropped successfully)
--
-- SELECT notification_type, COUNT(*) as unread_count
-- FROM notifications
-- WHERE notification_type IN ('shopping_reminder', 'cooling_off_ready')
--   AND is_read = false
-- GROUP BY notification_type;
--
-- Expected result: 0 rows (all shopping_reminder/cooling_off_ready notifications marked as read)
