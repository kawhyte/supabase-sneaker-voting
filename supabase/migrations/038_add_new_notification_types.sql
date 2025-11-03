-- Migration: 038_add_new_notification_types.sql
-- Purpose: Add 3 new notification types for shopping reminders, cooling-off, and milestones

BEGIN;

-- Step 1: Add bundled_notification_type column for grouped notifications
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS bundled_notification_type TEXT,
ADD COLUMN IF NOT EXISTS bundle_group_key TEXT;

-- Step 2: Create index for bundle queries
CREATE INDEX IF NOT EXISTS idx_notifications_bundle_group
ON notifications(user_id, bundled_notification_type, bundle_group_key)
WHERE bundled_notification_type IS NOT NULL;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN notifications.bundled_notification_type IS
'Type of bundled notification (e.g., "wear_reminder_bundle"). Used for grouping multiple notifications into one.';

COMMENT ON COLUMN notifications.bundle_group_key IS
'Unique key for grouping notifications (e.g., "wear_reminders_2025-11-03"). All notifications with same key are bundled.';

-- Step 4: Update notification type check constraint (if exists)
-- Note: Supabase may not have CHECK constraints on type, but we document supported types
COMMENT ON COLUMN notifications.notification_type IS
'Supported types: price_alert, wear_reminder, seasonal_tip, achievement_unlock, outfit_suggestion, shopping_reminder, cooling_off_ready, cost_per_wear_milestone';

COMMIT;
