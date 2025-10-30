-- ============================================================================
-- UNIFIED NOTIFICATIONS TABLE
-- ============================================================================
-- Purpose: Single source of truth for all notification types with smart bundling
-- Retention: Auto-expires based on read status (7 days read, 30 days unread)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification Type & Content
  notification_type VARCHAR(50) NOT NULL CHECK (
    notification_type IN (
      'price_alert',
      'wear_reminder',
      'seasonal_tip',
      'achievement_unlock',
      'outfit_suggestion'
    )
  ),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Navigation & Actions
  link_url TEXT, -- e.g., "/dashboard?tab=owned&item=123"
  action_label TEXT, -- e.g., "View Item", "Create Outfit"
  action_url TEXT, -- Optional secondary action

  -- Metadata & Severity
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')),
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexible storage for type-specific data

  -- Bundling Support (prevent notification spam)
  group_key VARCHAR(100), -- e.g., "wear_reminder_60days_2025-10-29"
  is_bundled BOOLEAN DEFAULT FALSE,
  bundled_count INTEGER DEFAULT 1, -- Number of items in bundle
  bundled_items JSONB DEFAULT '[]'::jsonb, -- Array of bundled item details

  -- Read Status & Expiry
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Snooze Functionality
  snoozed_until TIMESTAMP WITH TIME ZONE,

  -- Auto-calculated expiry (7 days if read, 30 days if unread)
  -- Calculated via trigger since NOW() is not immutable for GENERATED ALWAYS
  expiry_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

-- Primary query: Get unread notifications for user (most common)
-- Note: Application layer filters out snoozed notifications (can't use NOW() in index predicate)
CREATE INDEX idx_notifications_user_unread
  ON public.notifications(user_id, is_read, created_at DESC)
  WHERE is_read = FALSE;

-- Cleanup query: Find expired notifications
-- Note: Application layer filters by expiry_at (can't use NOW() in index predicate)
CREATE INDEX idx_notifications_expiry
  ON public.notifications(expiry_at);

-- Bundling query: Find existing bundles to update
CREATE INDEX idx_notifications_group_key
  ON public.notifications(user_id, group_key, created_at DESC)
  WHERE group_key IS NOT NULL AND is_bundled = TRUE;

-- Type filtering
CREATE INDEX idx_notifications_type
  ON public.notifications(user_id, notification_type, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, snooze)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- System can delete expired notifications (via service role)
CREATE POLICY "Service role can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (true);

-- ============================================================================
-- FUNCTION: Update timestamp on any table
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_timestamps_on_write()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Calculate expiry_at and update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_notification_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate expiry_at based on read status
  IF NEW.is_read AND NEW.read_at IS NOT NULL THEN
    NEW.expiry_at = NEW.read_at + INTERVAL '7 days';
  ELSE
    NEW.expiry_at = NEW.created_at + INTERVAL '30 days';
  END IF;

  -- Update the updated_at timestamp
  NEW.updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_calculate_expiry
  BEFORE INSERT OR UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_notification_expiry();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.notifications IS 'Unified notification storage with smart bundling and auto-expiry';
COMMENT ON COLUMN public.notifications.group_key IS 'Bundling key format: {type}_{severity}_{date}';
COMMENT ON COLUMN public.notifications.metadata IS 'Type-specific data: item_id, outfit_id, price_data, etc.';
COMMENT ON COLUMN public.notifications.expiry_at IS 'Auto-calculated: 7 days after read, 30 days after creation';
