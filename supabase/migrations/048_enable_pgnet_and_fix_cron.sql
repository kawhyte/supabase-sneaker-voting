-- Migration 048: Enable pg_net extension and fix pg_cron setup
-- Fixes: "ERROR: schema 'net' does not exist" when pg_cron tries to call edge functions

-- Enable pg_net extension (required for net.http_post() in cron jobs)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Enable pg_cron extension (should already be enabled, but safe to re-run)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing cron jobs if they exist (idempotent)
SELECT cron.unschedule('weekly-price-check') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-price-check'
);

-- Create weekly price check cron job
-- Runs every Sunday at 2:00 AM UTC
-- Calls the check-prices edge function
SELECT cron.schedule(
  'weekly-price-check',
  '0 2 * * 0', -- Every Sunday at 2:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://ayfabzqcjedgvhhityxc.supabase.co/functions/v1/check-prices',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZmFienFjamVkZ3ZoaGl0eXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mjk4OTQsImV4cCI6MjA3NDQwNTg5NH0.bh3AuNE9MKGYfER8kF8i3qm_ZLfb1yF9r94DqAH6H6o'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verify the cron job was created
SELECT
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'weekly-price-check';

-- Check cron extension is enabled
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');

COMMENT ON EXTENSION pg_net IS 'HTTP client for PostgreSQL - required for pg_cron to call edge functions';
