-- Migration: 039_enhance_notification_preferences.sql
-- Purpose: Add preference columns for new notification types

BEGIN;

-- Step 1: Add new preference columns
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS shopping_reminders_in_app BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS shopping_reminders_push BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shopping_reminders_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cooling_off_ready_in_app BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cooling_off_ready_push BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cooling_off_ready_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cost_per_wear_milestones_in_app BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS cost_per_wear_milestones_push BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cost_per_wear_milestones_email BOOLEAN DEFAULT false;

-- Step 2: Set defaults for existing users
UPDATE notification_preferences
SET
  shopping_reminders_in_app = true,
  shopping_reminders_push = false,
  shopping_reminders_email = false,
  cooling_off_ready_in_app = false,  -- Default OFF per user request
  cooling_off_ready_push = false,
  cooling_off_ready_email = false,
  cost_per_wear_milestones_in_app = true,
  cost_per_wear_milestones_push = false,
  cost_per_wear_milestones_email = false
WHERE user_id IS NOT NULL;

-- Step 3: Add comments for documentation
COMMENT ON COLUMN notification_preferences.shopping_reminders_in_app IS
'Show "Instead of Shopping" reminders in notification center (replaces modal)';

COMMENT ON COLUMN notification_preferences.cooling_off_ready_in_app IS
'Notify when wishlist item finishes cooling-off period (default: off per user preference)';

COMMENT ON COLUMN notification_preferences.cost_per_wear_milestones_in_app IS
'Notify when item achieves cost-per-wear milestone (e.g., $5/wear achieved)';

COMMIT;
