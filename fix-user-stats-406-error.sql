-- ============================================================================
-- FIX: 406 Error on user_stats Table
-- ============================================================================
-- This script creates the user_stats table and backfills data for existing users
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- Step 1: Create user_stats table
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

  -- Most Worn Item (references items table)
  most_worn_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  most_worn_count INTEGER DEFAULT 0,

  -- Notification Metrics (cached for performance)
  unread_notification_count INTEGER DEFAULT 0,
  last_notification_at TIMESTAMP WITH TIME ZONE,

  -- Achievement Progress
  achievements_unlocked INTEGER DEFAULT 0,
  total_achievements INTEGER DEFAULT 8,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_stats_unread_count
  ON public.user_stats(unread_notification_count)
  WHERE unread_notification_count > 0;

-- Step 3: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Service role can manage stats" ON public.user_stats;

-- Users can view their own stats
CREATE POLICY "Users can view own stats"
  ON public.user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own stats
CREATE POLICY "Users can insert own stats"
  ON public.user_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update own stats"
  ON public.user_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all stats
CREATE POLICY "Service role can manage stats"
  ON public.user_stats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 4: Create trigger function to initialize stats for new users
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_stats ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_stats();

-- Step 5: Create function to update unread notification count
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_unread_notification_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment on INSERT (new notification)
  IF TG_OP = 'INSERT' THEN
    -- Ensure user_stats record exists
    INSERT INTO public.user_stats (user_id, unread_notification_count, last_notification_at)
    VALUES (NEW.user_id, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET
      unread_notification_count = public.user_stats.unread_notification_count + 1,
      last_notification_at = NOW(),
      updated_at = NOW();
    RETURN NEW;
  END IF

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS notifications_update_unread_count ON public.notifications;

-- Create trigger on notifications table (if notifications table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    CREATE TRIGGER notifications_update_unread_count
      AFTER INSERT OR UPDATE OR DELETE ON public.notifications
      FOR EACH ROW
      EXECUTE FUNCTION public.update_unread_notification_count();
  END IF;
END $$;

-- Step 6: Backfill existing users
-- ============================================================================

INSERT INTO public.user_stats (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_stats)
ON CONFLICT (user_id) DO NOTHING;

-- Step 7: Add table comments
-- ============================================================================

COMMENT ON TABLE public.user_stats IS 'Cached user metrics updated via triggers for performance';
COMMENT ON COLUMN public.user_stats.unread_notification_count IS 'Cached count - updated by trigger on notifications table';

-- Step 8: Verify setup
-- ============================================================================

DO $$
DECLARE
  total_users INTEGER;
  users_with_stats INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO users_with_stats FROM public.user_stats;

  RAISE NOTICE '✅ Setup complete!';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with stats: %', users_with_stats;

  IF total_users = users_with_stats THEN
    RAISE NOTICE '✅ All users have user_stats records';
  ELSE
    RAISE WARNING '⚠️  % users still missing user_stats records', (total_users - users_with_stats);
  END IF;
END $$;
