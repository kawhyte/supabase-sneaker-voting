-- ============================================================================
-- USER DISMISSED SEASONAL ALERTS TABLE
-- ============================================================================
-- Purpose: Track which seasonal alerts users have dismissed (prevent re-show)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_dismissed_seasonal_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  year INTEGER NOT NULL,
  dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: One dismissal per season per year per user
  UNIQUE(user_id, season, year)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_dismissed_seasonal_user_year
  ON public.user_dismissed_seasonal_alerts(user_id, year);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.user_dismissed_seasonal_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own dismissals
CREATE POLICY "Users can view own dismissals"
  ON public.user_dismissed_seasonal_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own dismissals
CREATE POLICY "Users can insert own dismissals"
  ON public.user_dismissed_seasonal_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage (for cleanup)
CREATE POLICY "Service role can manage dismissals"
  ON public.user_dismissed_seasonal_alerts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_dismissed_seasonal_alerts IS 'Track dismissed seasonal alerts to prevent re-showing in same year';
