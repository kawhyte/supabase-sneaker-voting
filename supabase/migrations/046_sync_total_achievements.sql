-- ============================================================================
-- SYNC TOTAL_ACHIEVEMENTS COUNT
-- ============================================================================
-- Purpose: Keep user_stats.total_achievements in sync with achievements table
-- Updates: total_achievements column to reflect active achievement count
-- ============================================================================

-- ============================================================================
-- FUNCTION: Update total_achievements count for all users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_total_achievements()
RETURNS VOID AS $$
DECLARE
  v_achievement_count INTEGER;
BEGIN
  -- Count active achievements
  SELECT COUNT(*)
  INTO v_achievement_count
  FROM public.achievements
  WHERE is_active = TRUE;

  -- Update all user_stats records
  UPDATE public.user_stats
  SET
    total_achievements = v_achievement_count,
    updated_at = NOW();

  RAISE NOTICE 'Updated total_achievements to % for all users', v_achievement_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FUNCTION: Sync total_achievements when achievements change
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_achievements_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate total achievements whenever achievements table changes
  PERFORM public.sync_total_achievements();

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-sync total_achievements
-- ============================================================================

DROP TRIGGER IF EXISTS achievements_sync_total ON public.achievements;

CREATE TRIGGER achievements_sync_total
  AFTER INSERT OR UPDATE OR DELETE ON public.achievements
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.handle_achievements_change();

-- ============================================================================
-- INITIAL SYNC: Set total_achievements to 11 (current count)
-- ============================================================================

DO $$
BEGIN
  PERFORM public.sync_total_achievements();
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.sync_total_achievements IS 'Updates total_achievements count in user_stats based on active achievements';
COMMENT ON FUNCTION public.handle_achievements_change IS 'Trigger function to auto-sync total_achievements when achievements table changes';
COMMENT ON TRIGGER achievements_sync_total ON public.achievements IS 'Automatically syncs total_achievements count whenever achievements are added/removed';
