-- ============================================================================
-- AUTO-SYNC ACHIEVEMENTS_UNLOCKED COUNT
-- ============================================================================
-- Purpose: Keep user_stats.achievements_unlocked in sync with user_achievements
-- Trigger: Updates count whenever achievements are unlocked or removed
-- ============================================================================

-- ============================================================================
-- TRIGGER FUNCTION: Update achievements_unlocked count on INSERT/DELETE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_achievements_unlocked()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: Increment achievements_unlocked
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_stats
    SET
      achievements_unlocked = achievements_unlocked + 1,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;

    -- If user_stats row doesn't exist, create it
    IF NOT FOUND THEN
      INSERT INTO public.user_stats (user_id, achievements_unlocked)
      VALUES (NEW.user_id, 1)
      ON CONFLICT (user_id) DO UPDATE
      SET achievements_unlocked = user_stats.achievements_unlocked + 1,
          updated_at = NOW();
    END IF;

    RETURN NEW;
  END IF;

  -- Handle DELETE: Decrement achievements_unlocked (safeguard against negative)
  IF TG_OP = 'DELETE' THEN
    UPDATE public.user_stats
    SET
      achievements_unlocked = GREATEST(achievements_unlocked - 1, 0),
      updated_at = NOW()
    WHERE user_id = OLD.user_id;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-sync achievements_unlocked on user_achievements changes
-- ============================================================================

DROP TRIGGER IF EXISTS user_achievements_sync_count ON public.user_achievements;

CREATE TRIGGER user_achievements_sync_count
  AFTER INSERT OR DELETE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_achievements_unlocked();

-- ============================================================================
-- BACKFILL: Sync existing achievements for all users
-- ============================================================================

DO $$
DECLARE
  v_user RECORD;
  v_achievement_count INTEGER;
BEGIN
  -- Loop through all users with achievements
  FOR v_user IN
    SELECT user_id, COUNT(*) as unlocked_count
    FROM public.user_achievements
    GROUP BY user_id
  LOOP
    -- Update user_stats with correct count
    UPDATE public.user_stats
    SET
      achievements_unlocked = v_user.unlocked_count,
      updated_at = NOW()
    WHERE user_id = v_user.user_id;

    -- If user_stats row doesn't exist, create it
    IF NOT FOUND THEN
      INSERT INTO public.user_stats (user_id, achievements_unlocked)
      VALUES (v_user.user_id, v_user.unlocked_count)
      ON CONFLICT (user_id) DO UPDATE
      SET achievements_unlocked = v_user.unlocked_count,
          updated_at = NOW();
    END IF;

    RAISE NOTICE 'Synced % achievements for user %', v_user.unlocked_count, v_user.user_id;
  END LOOP;

  RAISE NOTICE 'Achievements sync completed';
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.sync_achievements_unlocked IS 'Auto-syncs user_stats.achievements_unlocked when user_achievements changes';
COMMENT ON TRIGGER user_achievements_sync_count ON public.user_achievements IS 'Keeps achievements_unlocked count in sync with actual unlocked achievements';
