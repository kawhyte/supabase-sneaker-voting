-- Migration 048: Update price check schedule to Monday, Wednesday, Friday
-- Changes from weekly (Sunday) to three times per week
-- Runs at 2 AM UTC on Monday, Wednesday, and Friday

-- Unschedule the existing weekly job
SELECT cron.unschedule('weekly-price-check');

-- Schedule new job for Monday, Wednesday, Friday
-- Cron format: minute hour day-of-month month day-of-week
-- '0 2 * * 1,3,5' = Every Monday, Wednesday, Friday at 2:00 AM UTC
-- Day codes: 1=Monday, 3=Wednesday, 5=Friday
SELECT cron.schedule(
  'weekly-price-check',
  '0 2 * * 1,3,5',
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

-- Verify cron job was updated
-- Run this query manually to confirm:
-- SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'weekly-price-check';

-- Add comment documenting the change
COMMENT ON EXTENSION pg_cron IS 'Postgres cron scheduler - Price checks run Mon/Wed/Fri at 2 AM UTC';
