-- Migration 024: Schedule weekly price checks via pg_cron
-- Runs every Sunday at 2 AM UTC
-- Triggers the check-prices edge function automatically

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule price check job
-- Cron format: minute hour day-of-month month day-of-week
-- '0 2 * * 0' = Every Sunday at 2:00 AM UTC
SELECT cron.schedule(
  'weekly-price-check',
  '0 2 * * 0',
  $$
  SELECT
    net.http_post(
      url := 'https://ayfabzqcjedgvhhityxc.supabase.co/functions/v1/check-prices',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZmFienFjamVkZ3ZoaGl0eXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mjk4OTQsImV4cCI6MjA3NDQwNTg5NH0.bh3AuNE9MKGYfER8kF8i3qm_ZLfb1yF9r94DqAH6H6o'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_items_price_tracking
ON items(status, auto_price_tracking_enabled, product_url)
WHERE status = 'wishlisted'
  AND auto_price_tracking_enabled = TRUE
  AND product_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_price_history_item_date
ON price_history(item_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_alerts_unread
ON price_alerts(user_id, is_read, created_at DESC)
WHERE is_read = FALSE;

-- Add helpful comments
COMMENT ON EXTENSION pg_cron IS 'Postgres cron scheduler for automated tasks';
COMMENT ON INDEX idx_items_price_tracking IS 'Optimizes query for weekly price check job (fetches wishlisted items with tracking enabled)';
COMMENT ON INDEX idx_price_history_item_date IS 'Optimizes lookup of previous price for drop detection';
COMMENT ON INDEX idx_price_alerts_unread IS 'Optimizes dashboard query for unread price alerts';

-- Verify cron job was created
-- Run this query manually to confirm:
-- SELECT * FROM cron.job WHERE jobname = 'weekly-price-check';
