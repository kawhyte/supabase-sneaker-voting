-- ============================================================================
-- BACKFILL USER STATS FOR EXISTING USERS
-- ============================================================================
-- Purpose: Initialize user_stats records for users created before migration 034
-- Run this after applying 034_create_user_stats.sql
-- ============================================================================

-- Insert user_stats for all existing users who don't have a record yet
INSERT INTO public.user_stats (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_stats)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- VERIFY BACKFILL
-- ============================================================================

DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_count
  FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM public.user_stats);

  IF missing_count > 0 THEN
    RAISE WARNING 'Still % users without user_stats records', missing_count;
  ELSE
    RAISE NOTICE 'All users have user_stats records';
  END IF;
END $$;
