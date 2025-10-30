-- ============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================================
-- Purpose: Granular user control over notification behavior
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ========================================================================
  -- NOTIFICATION CHANNELS (Email deferred to future)
  -- ========================================================================
  enable_in_app BOOLEAN DEFAULT TRUE,
  enable_push BOOLEAN DEFAULT FALSE,
  enable_email BOOLEAN DEFAULT FALSE, -- Future: Email notifications

  -- ========================================================================
  -- NOTIFICATION TYPES (Individual toggles)
  -- ========================================================================
  price_alerts_enabled BOOLEAN DEFAULT TRUE,
  wear_reminders_enabled BOOLEAN DEFAULT TRUE,
  seasonal_tips_enabled BOOLEAN DEFAULT TRUE,
  achievements_enabled BOOLEAN DEFAULT TRUE,
  outfit_suggestions_enabled BOOLEAN DEFAULT FALSE, -- Future feature

  -- ========================================================================
  -- QUIET HOURS (Timezone-aware)
  -- ========================================================================
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00'::TIME, -- 10:00 PM
  quiet_hours_end TIME DEFAULT '08:00'::TIME, -- 8:00 AM
  user_timezone VARCHAR(100) DEFAULT 'UTC', -- IANA timezone (e.g., "America/New_York")

  -- ========================================================================
  -- FREQUENCY & BUNDLING
  -- ========================================================================
  max_daily_notifications INTEGER DEFAULT 10 CHECK (max_daily_notifications BETWEEN 1 AND 50),
  enable_bundling BOOLEAN DEFAULT TRUE,
  bundle_threshold INTEGER DEFAULT 3 CHECK (bundle_threshold BETWEEN 2 AND 10),

  -- ========================================================================
  -- PREFERENCES VERSION (for future migrations)
  -- ========================================================================
  preferences_version INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_notification_preferences_user
  ON public.notification_preferences(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences (on signup)
CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamps_on_write();

-- ============================================================================
-- FUNCTION: Initialize default preferences for new users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.initialize_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new user signup
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_notification_preferences();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.notification_preferences IS 'User notification preferences with granular controls';
COMMENT ON COLUMN public.notification_preferences.user_timezone IS 'IANA timezone for quiet hours calculation';
COMMENT ON COLUMN public.notification_preferences.bundle_threshold IS 'Minimum items to create a bundle (e.g., 3 items = 1 bundled notification)';
