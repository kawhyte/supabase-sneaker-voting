-- ============================================================================
-- USER STATS TABLE
-- ============================================================================
-- Purpose: Cached metrics to avoid expensive COUNT(*) queries
-- Updated via triggers and scheduled jobs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Wardrobe Statistics
  total_items INTEGER DEFAULT 0,
  owned_items INTEGER DEFAULT 0,
  wishlisted_items INTEGER DEFAULT 0,
  total_outfits INTEGER DEFAULT 0,

  -- Financial Metrics
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  average_cost_per_wear DECIMAL(10, 2) DEFAULT 0.00,
  total_savings_from_alerts DECIMAL(10, 2) DEFAULT 0.00,

  -- Most Worn Item
  most_worn_item_id UUID REFERENCES public.sneakers(id) ON DELETE SET NULL,
  most_worn_count INTEGER DEFAULT 0,

  -- Notification Metrics (cached for performance)
  unread_notification_count INTEGER DEFAULT 0,
  last_notification_at TIMESTAMP WITH TIME ZONE,

  -- Achievement Progress
  achievements_unlocked INTEGER DEFAULT 0,
  total_achievements INTEGER DEFAULT 8, -- Update as you add achievements

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_stats_unread_count
  ON public.user_stats(unread_notification_count)
  WHERE unread_notification_count > 0;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats
CREATE POLICY "Users can view own stats"
  ON public.user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage stats
CREATE POLICY "Service role can manage stats"
  ON public.user_stats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGER: Initialize stats for new users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_stats();

-- ============================================================================
-- FUNCTION: Update unread notification count
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_unread_notification_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment on INSERT (new notification)
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_stats
    SET
      unread_notification_count = unread_notification_count + 1,
      last_notification_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  END IF;

  -- Decrement on UPDATE (marked as read)
  IF TG_OP = 'UPDATE' AND OLD.is_read = FALSE AND NEW.is_read = TRUE THEN
    UPDATE public.user_stats
    SET
      unread_notification_count = GREATEST(unread_notification_count - 1, 0),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  END IF;

  -- Decrement on DELETE (notification deleted)
  IF TG_OP = 'DELETE' AND OLD.is_read = FALSE THEN
    UPDATE public.user_stats
    SET
      unread_notification_count = GREATEST(unread_notification_count - 1, 0),
      updated_at = NOW()
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notifications_update_unread_count
  AFTER INSERT OR UPDATE OR DELETE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unread_notification_count();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_stats IS 'Cached user metrics updated via triggers for performance';
COMMENT ON COLUMN public.user_stats.unread_notification_count IS 'Cached count - updated by trigger on notifications table';
