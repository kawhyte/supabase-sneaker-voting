-- ============================================================================
-- SEASONAL CONTENT TABLE
-- ============================================================================
-- Purpose: Pre-configured seasonal alerts with wardrobe suggestions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.seasonal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Season Information
  season VARCHAR(20) NOT NULL UNIQUE CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  start_date DATE NOT NULL, -- e.g., '2025-03-20' (Spring Equinox)
  end_date DATE NOT NULL,

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon_emoji VARCHAR(10), -- e.g., '🍂' for fall

  -- Wardrobe Suggestions (query filters)
  suggested_categories JSONB DEFAULT '[]'::jsonb, -- ["outerwear", "sweaters"]
  suggested_colors JSONB DEFAULT '[]'::jsonb, -- ["brown", "orange", "burgundy"]
  suggested_tips JSONB DEFAULT '[]'::jsonb, -- ["Bring out sweaters", "Introduce earth tones"]

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_seasonal_content_dates
  ON public.seasonal_content(start_date, end_date)
  WHERE is_active = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.seasonal_content ENABLE ROW LEVEL SECURITY;

-- Public read access (all users can view seasonal content)
CREATE POLICY "Anyone can view active seasonal content"
  ON public.seasonal_content
  FOR SELECT
  USING (is_active = TRUE);

-- Only service role can modify
CREATE POLICY "Service role can manage seasonal content"
  ON public.seasonal_content
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SEED DATA: 4 Seasons
-- ============================================================================

INSERT INTO public.seasonal_content (season, start_date, end_date, title, message, icon_emoji, suggested_categories, suggested_colors, suggested_tips)
VALUES
  (
    'fall',
    '2025-09-21',
    '2025-12-20',
    'Fall is Here! Embrace cozy layers and warm tones',
    'Autumn has arrived! It''s time to bring out those cozy pieces and rich colors that make this season so special.',
    '🍂',
    '["outerwear", "tops", "sweaters"]'::jsonb,
    '["brown", "orange", "burgundy", "olive", "mustard"]'::jsonb,
    '["Bring out sweaters and cardigans", "Introduce earth tones and jewel tones", "Layer with light jackets", "Perfect time for boots"]'::jsonb
  ),
  (
    'winter',
    '2025-12-21',
    '2026-03-19',
    'Winter Wardrobe: Bundle up in style',
    'Winter is here! Time to embrace warm layers, cozy outerwear, and winter accessories.',
    '❄️',
    '["outerwear", "boots", "accessories"]'::jsonb,
    '["black", "navy", "gray", "burgundy", "forest green"]'::jsonb,
    '["Heavy outerwear is essential", "Don''t forget winter boots", "Layer for warmth", "Add scarves and beanies"]'::jsonb
  ),
  (
    'spring',
    '2026-03-20',
    '2026-06-20',
    'Spring Refresh: Lighter layers and pastels',
    'Spring has sprung! Time to refresh your wardrobe with lighter fabrics and fresh colors.',
    '🌸',
    '["tops", "sneakers", "light jackets"]'::jsonb,
    '["pastel pink", "light blue", "mint", "lavender", "cream"]'::jsonb,
    '["Transition to lighter jackets", "Bring out pastel colors", "Perfect weather for sneakers", "Layer with lighter pieces"]'::jsonb
  ),
  (
    'summer',
    '2026-06-21',
    '2026-09-20',
    'Summer Vibes: Breathable fabrics and bright colors',
    'Summer is here! Embrace breathable fabrics, bright colors, and warm-weather essentials.',
    '☀️',
    '["shorts", "t-shirts", "sandals", "accessories"]'::jsonb,
    '["white", "bright yellow", "coral", "turquoise", "hot pink"]'::jsonb,
    '["Switch to breathable fabrics", "Bright colors are in", "Perfect time for shorts", "Don''t forget sunglasses"]'::jsonb
  )
ON CONFLICT (season) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  icon_emoji = EXCLUDED.icon_emoji,
  suggested_categories = EXCLUDED.suggested_categories,
  suggested_colors = EXCLUDED.suggested_colors,
  suggested_tips = EXCLUDED.suggested_tips,
  updated_at = NOW();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.seasonal_content IS 'Pre-configured seasonal alerts with wardrobe suggestions';
COMMENT ON COLUMN public.seasonal_content.suggested_categories IS 'Array of category IDs to filter wardrobe';
COMMENT ON COLUMN public.seasonal_content.suggested_tips IS 'Array of actionable tips for the season';
