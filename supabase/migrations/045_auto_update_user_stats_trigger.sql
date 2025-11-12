-- ============================================================================
-- AUTO-UPDATE USER_STATS TRIGGER
-- ============================================================================
-- Purpose: Automatically recalculate user_stats when items table changes
-- Triggers on: INSERT, UPDATE, DELETE on items table
-- Updates: total_items, owned_items, wishlisted_items, total_spent,
--          average_cost_per_wear, most_worn_item_id, most_worn_count
-- ============================================================================

-- ============================================================================
-- FUNCTION: Recalculate user stats for a given user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_user_stats(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_items INTEGER;
  v_owned_items INTEGER;
  v_wishlisted_items INTEGER;
  v_total_spent DECIMAL(10, 2);
  v_avg_cpw DECIMAL(10, 2);
  v_most_worn_id UUID;
  v_most_worn_count INTEGER;
BEGIN
  -- Get total items count (non-archived)
  SELECT COUNT(*)
  INTO v_total_items
  FROM public.items
  WHERE user_id = target_user_id
    AND is_archived = FALSE;

  -- Get owned items count
  SELECT COUNT(*)
  INTO v_owned_items
  FROM public.items
  WHERE user_id = target_user_id
    AND status = 'owned'
    AND is_archived = FALSE;

  -- Get wishlisted items count
  SELECT COUNT(*)
  INTO v_wishlisted_items
  FROM public.items
  WHERE user_id = target_user_id
    AND status = 'wishlisted'
    AND is_archived = FALSE;

  -- Calculate total spent (owned items only)
  SELECT COALESCE(SUM(COALESCE(purchase_price, 0)), 0)
  INTO v_total_spent
  FROM public.items
  WHERE user_id = target_user_id
    AND status = 'owned'
    AND is_archived = FALSE;

  -- Calculate average cost-per-wear (only items with wears > 0)
  SELECT
    CASE
      WHEN COUNT(*) > 0 THEN
        AVG(COALESCE(purchase_price, retail_price) / wears)
      ELSE 0
    END
  INTO v_avg_cpw
  FROM public.items
  WHERE user_id = target_user_id
    AND status = 'owned'
    AND is_archived = FALSE
    AND wears > 0
    AND (purchase_price > 0 OR retail_price > 0);

  -- Get most worn item
  SELECT id, wears
  INTO v_most_worn_id, v_most_worn_count
  FROM public.items
  WHERE user_id = target_user_id
    AND status = 'owned'
    AND is_archived = FALSE
    AND wears IS NOT NULL
  ORDER BY wears DESC, last_worn_date DESC NULLS LAST
  LIMIT 1;

  -- Update or insert user_stats
  INSERT INTO public.user_stats (
    user_id,
    total_items,
    owned_items,
    wishlisted_items,
    total_spent,
    average_cost_per_wear,
    most_worn_item_id,
    most_worn_count,
    updated_at
  )
  VALUES (
    target_user_id,
    v_total_items,
    v_owned_items,
    v_wishlisted_items,
    v_total_spent,
    COALESCE(v_avg_cpw, 0),
    v_most_worn_id,
    COALESCE(v_most_worn_count, 0),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_items = EXCLUDED.total_items,
    owned_items = EXCLUDED.owned_items,
    wishlisted_items = EXCLUDED.wishlisted_items,
    total_spent = EXCLUDED.total_spent,
    average_cost_per_wear = EXCLUDED.average_cost_per_wear,
    most_worn_item_id = EXCLUDED.most_worn_item_id,
    most_worn_count = EXCLUDED.most_worn_count,
    updated_at = NOW();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FUNCTION: Handle items table changes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_items_change()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT or UPDATE, recalculate stats for the affected user
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM public.recalculate_user_stats(NEW.user_id);
    RETURN NEW;
  END IF;

  -- On DELETE, recalculate stats for the deleted item's user
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_user_stats(OLD.user_id);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-update user_stats on items changes
-- ============================================================================

DROP TRIGGER IF EXISTS items_update_user_stats ON public.items;

CREATE TRIGGER items_update_user_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_items_change();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.recalculate_user_stats IS 'Recalculates all user_stats metrics for a given user based on items table';
COMMENT ON FUNCTION public.handle_items_change IS 'Trigger function to auto-update user_stats when items are created, updated, or deleted';
COMMENT ON TRIGGER items_update_user_stats ON public.items IS 'Automatically recalculates user_stats whenever items table changes';

-- ============================================================================
-- BACKFILL: Recalculate stats for all existing users
-- ============================================================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN (SELECT DISTINCT user_id FROM public.items WHERE user_id IS NOT NULL)
  LOOP
    PERFORM public.recalculate_user_stats(user_record.user_id);
  END LOOP;

  RAISE NOTICE 'Backfilled user_stats for all users with items';
END $$;
