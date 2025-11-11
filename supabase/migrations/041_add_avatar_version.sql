-- =====================================================
-- MIGRATION 041: Add Avatar Version Column
-- =====================================================
-- Purpose: Add version-based cache busting for avatar updates
--          to ensure immediate UI refresh without timestamp issues
--
-- Backwards Compatible: YES ✅
-- Deployment Strategy: Zero-downtime (additive changes only)
-- =====================================================

BEGIN;

-- Step 1: Add avatar_version column with default value
ALTER TABLE public.profiles
  ADD COLUMN avatar_version integer DEFAULT 1 NOT NULL;

-- Step 2: Create index for faster lookups (optional, but good practice)
CREATE INDEX idx_profiles_avatar_version
  ON public.profiles(avatar_version);

-- Step 3: Create function to auto-increment version on avatar change
CREATE OR REPLACE FUNCTION public.increment_avatar_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if avatar-related fields changed
  IF (
    NEW.avatar_type IS DISTINCT FROM OLD.avatar_type OR
    NEW.preset_avatar_id IS DISTINCT FROM OLD.preset_avatar_id OR
    NEW.avatar_url IS DISTINCT FROM OLD.avatar_url
  ) THEN
    NEW.avatar_version = OLD.avatar_version + 1;
    NEW.avatar_updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-increment version
DROP TRIGGER IF EXISTS on_avatar_change ON public.profiles;

CREATE TRIGGER on_avatar_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_avatar_version();

-- Step 5: Add helpful comment
COMMENT ON COLUMN public.profiles.avatar_version IS
  'Version number for avatar cache busting. Auto-increments on avatar changes.';

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify column exists and has correct default
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'avatar_version';

-- Verify trigger exists
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_avatar_change';
