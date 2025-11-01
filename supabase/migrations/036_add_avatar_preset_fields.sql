-- =====================================================
-- MIGRATION 036: Add Avatar Preset Support
-- =====================================================
-- Purpose: Support both custom avatars (legacy) and
--          preset cat avatars (new system)
--
-- Backwards Compatible: YES ✅
-- Deployment Strategy: Zero-downtime (additive changes only)
-- =====================================================

BEGIN;

-- Step 1: Add avatar_type enum
CREATE TYPE avatar_type AS ENUM ('custom', 'preset');

-- Step 2: Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN avatar_type avatar_type DEFAULT 'custom',
  ADD COLUMN preset_avatar_id text DEFAULT NULL,
  ADD COLUMN avatar_updated_at timestamp with time zone DEFAULT NOW();

-- Step 3: Add check constraint (either custom URL or preset ID)
ALTER TABLE public.profiles
  ADD CONSTRAINT avatar_consistency_check
  CHECK (
    (avatar_type = 'custom' AND avatar_url IS NOT NULL AND preset_avatar_id IS NULL) OR
    (avatar_type = 'preset' AND preset_avatar_id IS NOT NULL) OR
    (avatar_url IS NULL AND preset_avatar_id IS NULL)
  );

-- Step 4: Create index for faster preset avatar lookups
CREATE INDEX idx_profiles_preset_avatar
  ON public.profiles(preset_avatar_id)
  WHERE preset_avatar_id IS NOT NULL;

-- Step 5: Mark all existing avatars as 'custom' type
UPDATE public.profiles
SET
  avatar_type = 'custom',
  avatar_updated_at = NOW()
WHERE avatar_url IS NOT NULL;

-- Step 6: Add helpful comment
COMMENT ON COLUMN public.profiles.avatar_type IS
  'Type of avatar: custom (user-uploaded URL) or preset (cat avatar ID)';

COMMENT ON COLUMN public.profiles.preset_avatar_id IS
  'ID of preset cat avatar (e.g., "cat-1", "cat-2"). Null if avatar_type is custom.';

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify migration succeeded
SELECT
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN avatar_type = 'custom' THEN 1 END) as custom_avatars,
  COUNT(CASE WHEN avatar_type = 'preset' THEN 1 END) as preset_avatars,
  COUNT(CASE WHEN avatar_url IS NULL AND preset_avatar_id IS NULL THEN 1 END) as no_avatar
FROM public.profiles;
