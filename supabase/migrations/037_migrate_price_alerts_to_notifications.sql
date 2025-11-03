-- Migration: 037_migrate_price_alerts_to_notifications.sql
-- Purpose: Migrate all price_alerts to unified notifications table
-- Rollback: See rollback section at bottom

BEGIN;

-- Step 1: Add legacy tracking column to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS legacy_price_alert_id UUID REFERENCES price_alerts(id) ON DELETE SET NULL;

-- Step 2: Migrate all existing price alerts to notifications
INSERT INTO notifications (
  user_id,
  notification_type,
  title,
  message,
  severity,
  link_url,
  action_label,
  metadata,
  is_read,
  created_at,
  legacy_price_alert_id
)
SELECT
  pa.user_id,
  'price_alert'::text,
  CASE
    WHEN pa.severity = 'high' THEN 'Big Price Drop! 🎉'
    WHEN pa.severity = 'medium' THEN 'Price Drop Alert 💰'
    ELSE 'Small Price Drop 👀'
  END as title,
  pa.message,
  pa.severity,
  '/dashboard?tab=wishlist&item=' || pa.item_id::text as link_url,
  'View Item' as action_label,
  jsonb_build_object(
    'item_id', pa.item_id,
    'current_price', pa.current_price,
    'previous_price', pa.previous_price,
    'percentage_off', pa.percentage_off,
    'migrated_from', 'price_alerts'
  ) as metadata,
  pa.is_read,
  pa.created_at,
  pa.id as legacy_price_alert_id
FROM price_alerts pa
WHERE NOT EXISTS (
  -- Avoid duplicates if migration runs twice
  SELECT 1 FROM notifications n WHERE n.legacy_price_alert_id = pa.id
);

-- Step 3: Verify migration
DO $$
DECLARE
  price_alerts_count INTEGER;
  migrated_notifications_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO price_alerts_count FROM price_alerts;
  SELECT COUNT(*) INTO migrated_notifications_count
  FROM notifications WHERE legacy_price_alert_id IS NOT NULL;

  IF price_alerts_count != migrated_notifications_count THEN
    RAISE EXCEPTION 'Migration validation failed: % price alerts but % migrated notifications',
      price_alerts_count, migrated_notifications_count;
  END IF;

  RAISE NOTICE 'Migration successful: % price alerts migrated', price_alerts_count;
END $$;

-- Step 4: Add index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_legacy_price_alert
ON notifications(legacy_price_alert_id)
WHERE legacy_price_alert_id IS NOT NULL;

-- Step 5: Create trigger to sync new price alerts (temporary dual-write)
CREATE OR REPLACE FUNCTION sync_price_alert_to_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    severity,
    link_url,
    action_label,
    metadata,
    is_read,
    legacy_price_alert_id
  ) VALUES (
    NEW.user_id,
    'price_alert',
    CASE
      WHEN NEW.severity = 'high' THEN 'Big Price Drop! 🎉'
      WHEN NEW.severity = 'medium' THEN 'Price Drop Alert 💰'
      ELSE 'Small Price Drop 👀'
    END,
    NEW.message,
    NEW.severity,
    '/dashboard?tab=wishlist&item=' || NEW.item_id::text,
    'View Item',
    jsonb_build_object(
      'item_id', NEW.item_id,
      'current_price', NEW.current_price,
      'previous_price', NEW.previous_price,
      'percentage_off', NEW.percentage_off,
      'migrated_from', 'price_alerts'
    ),
    NEW.is_read,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_price_alert_to_notification
AFTER INSERT ON price_alerts
FOR EACH ROW
EXECUTE FUNCTION sync_price_alert_to_notification();

COMMIT;

-- ROLLBACK SCRIPT (save separately as 037_rollback.sql)
/*
BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_sync_price_alert_to_notification ON price_alerts;
DROP FUNCTION IF EXISTS sync_price_alert_to_notification();

-- Delete migrated notifications
DELETE FROM notifications WHERE legacy_price_alert_id IS NOT NULL;

-- Drop index
DROP INDEX IF EXISTS idx_notifications_legacy_price_alert;

-- Drop column
ALTER TABLE notifications DROP COLUMN IF EXISTS legacy_price_alert_id;

COMMIT;
*/
