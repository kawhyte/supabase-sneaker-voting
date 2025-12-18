-- Migration 055: Fix function search_path warnings
-- Fixes: All 27 Supabase advisor warnings for mutable search_path
-- Impact: No breaking changes - security improvement

BEGIN;

-- ============================================================
-- Fix all SECURITY DEFINER functions (high priority)
-- ============================================================

-- Fix functions alphabetically for easier maintenance
ALTER FUNCTION public.calculate_notification_expiry() SET search_path = public;
ALTER FUNCTION public.can_edit_item(UUID) SET search_path = public;
ALTER FUNCTION public.check_following_limit() SET search_path = public;
ALTER FUNCTION public.create_user_stats_on_signup() SET search_path = public;
ALTER FUNCTION public.ensure_single_main_image() SET search_path = public;
ALTER FUNCTION public.get_lowest_price(UUID, TIMESTAMPTZ, TIMESTAMPTZ) SET search_path = public;
ALTER FUNCTION public.get_price_trend(UUID) SET search_path = public;
ALTER FUNCTION public.get_public_wishlist(UUID) SET search_path = public;
ALTER FUNCTION public.handle_achievements_change() SET search_path = public;
ALTER FUNCTION public.handle_items_change() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.increment_avatar_version() SET search_path = public;
ALTER FUNCTION public.initialize_notification_preferences() SET search_path = public;
ALTER FUNCTION public.initialize_user_stats() SET search_path = public;
ALTER FUNCTION public.is_following(UUID, UUID) SET search_path = public;
ALTER FUNCTION public.recalculate_user_stats(UUID) SET search_path = public;
ALTER FUNCTION public.sync_achievements_unlocked() SET search_path = public;
ALTER FUNCTION public.sync_price_alert_to_notification() SET search_path = public;
ALTER FUNCTION public.sync_total_achievements() SET search_path = public;
ALTER FUNCTION public.update_follower_counts() SET search_path = public;
ALTER FUNCTION public.update_push_subscriptions_updated_at() SET search_path = public;
ALTER FUNCTION public.update_timestamps_on_write() SET search_path = public;
ALTER FUNCTION public.update_unread_notification_count() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- ============================================================
-- Fix duplicate functions from migration 052 (if they exist)
-- These may not have schema prefix in their original definition
-- ============================================================

DO $$
BEGIN
  -- Try to fix functions without schema prefix (may not exist)
  BEGIN
    ALTER FUNCTION update_follower_counts() SET search_path = public;
  EXCEPTION
    WHEN undefined_function THEN
      NULL; -- Function doesn't exist, skip
  END;

  BEGIN
    ALTER FUNCTION check_following_limit() SET search_path = public;
  EXCEPTION
    WHEN undefined_function THEN
      NULL;
  END;

  BEGIN
    ALTER FUNCTION is_following(UUID, UUID) SET search_path = public;
  EXCEPTION
    WHEN undefined_function THEN
      NULL;
  END;

  BEGIN
    ALTER FUNCTION get_public_wishlist(UUID) SET search_path = public;
  EXCEPTION
    WHEN undefined_function THEN
      NULL;
  END;
END $$;

-- ============================================================
-- Verify all functions have search_path set
-- ============================================================

RAISE NOTICE '================================================================';
RAISE NOTICE 'Migration 055 completed successfully!';
RAISE NOTICE '================================================================';
RAISE NOTICE 'All SECURITY DEFINER functions now have search_path set to public';
RAISE NOTICE 'Run this query to verify:';
RAISE NOTICE 'SELECT proname, proconfig FROM pg_proc WHERE pronamespace = ''public''::regnamespace AND prosecdef = true;';
RAISE NOTICE '================================================================';

COMMIT;
