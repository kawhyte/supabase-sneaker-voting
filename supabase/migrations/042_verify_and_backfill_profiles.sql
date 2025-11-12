-- =====================================================
-- MIGRATION 042: Verify and Backfill Missing Profiles
-- =====================================================
-- Purpose: Ensure all auth.users have corresponding profiles
--          Defensive migration to handle edge cases where
--          trigger may have failed (rate limits, connection issues)
--
-- Backwards Compatible: YES ✅
-- Deployment Strategy: Zero-downtime (only INSERT, no destructive changes)
-- =====================================================

BEGIN;

-- Step 1: Insert missing profiles for users who don't have one
INSERT INTO public.profiles (
  id,
  display_name,
  avatar_url,
  avatar_type,
  avatar_version,
  updated_at,
  created_at
)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'display_name', u.email),
  u.raw_user_meta_data->>'avatar_url',
  CASE
    WHEN u.raw_user_meta_data->>'avatar_url' IS NOT NULL THEN 'custom'::avatar_type
    ELSE NULL
  END,
  1, -- Default avatar version
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL; -- Only users without profiles

-- Step 2: Log results for verification
DO $$
DECLARE
  backfilled_count integer;
  total_users integer;
  total_profiles integer;
BEGIN
  -- Count how many profiles were just created
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO total_profiles FROM public.profiles;

  backfilled_count := total_profiles - (SELECT COUNT(*) FROM public.profiles WHERE created_at < NOW() - INTERVAL '1 second');

  RAISE NOTICE 'Migration 042 completed:';
  RAISE NOTICE '  Total auth.users: %', total_users;
  RAISE NOTICE '  Total profiles: %', total_profiles;
  RAISE NOTICE '  Profiles created in this migration: %', backfilled_count;

  IF total_users = total_profiles THEN
    RAISE NOTICE '  ✅ All users have profiles!';
  ELSE
    RAISE WARNING '  ⚠️  Mismatch: % users vs % profiles', total_users, total_profiles;
  END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if any users are missing profiles
SELECT
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  CASE WHEN p.id IS NULL THEN '❌ Missing Profile' ELSE '✅ Has Profile' END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Count summary
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.id WHERE p.id IS NULL) as missing_profiles;
