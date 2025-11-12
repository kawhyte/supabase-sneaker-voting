-- ============================================================================
-- ACHIEVEMENTS TABLE
-- ============================================================================
-- Purpose: Achievement definitions and unlock tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Achievement Identity
  achievement_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'smart_spender'
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_emoji VARCHAR(10), -- e.g., '💰'

  -- Unlock Criteria (SQL query template)
  unlock_criteria JSONB NOT NULL, -- { "type": "sql", "query": "...", "threshold": 5 }

  -- Display
  category VARCHAR(50), -- 'financial', 'style', 'engagement'
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER ACHIEVEMENTS (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_achievements_user
  ON public.user_achievements(user_id, unlocked_at DESC);

CREATE INDEX idx_achievements_active
  ON public.achievements(achievement_key)
  WHERE is_active = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Anyone can view active achievements
CREATE POLICY "Anyone can view active achievements"
  ON public.achievements
  FOR SELECT
  USING (is_active = TRUE);

-- Users can view their own unlocked achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage
CREATE POLICY "Service role can manage achievements"
  ON public.achievements
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage user achievements"
  ON public.user_achievements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SEED DATA: Achievement Definitions
-- ============================================================================

INSERT INTO public.achievements (achievement_key, name, description, icon_emoji, unlock_criteria, category, points)
VALUES
  (
    'smart_spender',
    'Smart Spender',
    'You have 5 items with cost-per-wear under their target value. Great job maximizing value!',
    '💰',
    '{
      "type": "sql",
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned'' AND wears > 0 AND (purchase_price / wears) < CASE WHEN purchase_price < 50 THEN 2 WHEN purchase_price < 150 THEN 5 ELSE 10 END",
      "threshold": 5
    }'::jsonb,
    'financial',
    100
  ),
  (
    'stylist',
    'Stylist',
    'Created 10 outfits. You''re a true fashion curator!',
    '✨',
    '{
      "type": "sql",
      "query": "SELECT COUNT(*) FROM outfits WHERE user_id = $1 AND is_archived = FALSE",
      "threshold": 10
    }'::jsonb,
    'style',
    100
  ),
  (
    'fashionista',
    'Fashionista',
    'Wore every item in your wardrobe this month. Impressive rotation!',
    '👗',
    '{
      "type": "sql",
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned'' AND last_worn_date >= NOW() - INTERVAL ''30 days''",
      "threshold_type": "all_items"
    }'::jsonb,
    'engagement',
    200
  ),
  (
    'deal_finder',
    'Deal Finder',
    'Saved $500 from price drop alerts. You''re a savvy shopper!',
    '🏷️',
    '{
      "type": "sql",
      "query": "SELECT COALESCE(SUM(previous_price - current_price), 0) FROM price_alerts WHERE user_id = $1",
      "threshold": 500
    }'::jsonb,
    'financial',
    150
  ),
  (
    'collector',
    'Collector',
    'Built a wardrobe of 50+ items. You have great style!',
    '👕',
    '{
      "type": "sql",
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned''",
      "threshold": 50
    }'::jsonb,
    'engagement',
    100
  ),
  (
    'minimalist',
    'Minimalist',
    'Maintained a curated wardrobe of under 30 items for 3 months. Quality over quantity!',
    '🎯',
    '{
      "type": "custom",
      "description": "Manually tracked - requires history check"
    }'::jsonb,
    'style',
    150
  ),
  (
    'outfit_master',
    'Outfit Master',
    'Created 50 outfits. You''re a styling expert!',
    '👔',
    '{
      "type": "sql",
      "query": "SELECT COUNT(*) FROM outfits WHERE user_id = $1",
      "threshold": 50
    }'::jsonb,
    'style',
    200
  ),
  (
    'early_adopter',
    'Early Adopter',
    'Joined PurrView in the first month. Welcome to the community!',
    '🌟',
    '{
      "type": "custom",
      "description": "Manually awarded to early users"
    }'::jsonb,
    'engagement',
    50
  )
ON CONFLICT (achievement_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_emoji = EXCLUDED.icon_emoji,
  unlock_criteria = EXCLUDED.unlock_criteria,
  category = EXCLUDED.category,
  points = EXCLUDED.points;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.achievements IS 'Achievement definitions with unlock criteria';
COMMENT ON TABLE public.user_achievements IS 'User achievement unlocks (many-to-many)';
COMMENT ON COLUMN public.achievements.unlock_criteria IS 'JSONB with SQL query template and threshold for automated checking';
