-- ============================================================================
-- FIX ACHIEVEMENT DEFINITIONS
-- ============================================================================
-- Purpose: Sync database achievements with frontend ACHIEVEMENT_DEFINITIONS
-- Issue: Frontend uses achievement IDs like 'wardrobe_starter' but database
--        has different keys like 'smart_spender'. This causes foreign key errors.
-- ============================================================================

-- Step 1: Drop existing user_achievements (if any exist, we'll lose them temporarily)
-- This is safe since achievements are a new feature
TRUNCATE TABLE public.user_achievements;

-- Step 2: Clear old achievement definitions
DELETE FROM public.achievements;

-- Step 3: Insert new achievement definitions that match frontend
INSERT INTO public.achievements (achievement_key, name, description, icon_emoji, unlock_criteria, category, points)
VALUES
  -- Wardrobe Size Milestones
  (
    'wardrobe_starter',
    'Collection Starter',
    'Add your first 10 items to PurrView',
    '📦',
    '{
      "type": "count",
      "metric": "total_items",
      "threshold": 10,
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned'' AND is_archived = FALSE"
    }'::jsonb,
    'wardrobe',
    10
  ),
  (
    'wardrobe_curator',
    'Wardrobe Curator',
    'Catalog 25 items in your collection',
    '👕',
    '{
      "type": "count",
      "metric": "total_items",
      "threshold": 25,
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned'' AND is_archived = FALSE"
    }'::jsonb,
    'wardrobe',
    25
  ),
  (
    'style_connoisseur',
    'Style Connoisseur',
    'Build a collection of 50 curated items',
    '✨',
    '{
      "type": "count",
      "metric": "total_items",
      "threshold": 50,
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned'' AND is_archived = FALSE"
    }'::jsonb,
    'wardrobe',
    50
  ),

  -- Outfit Creation
  (
    'outfit_creator',
    'Outfit Creator',
    'Create your first outfit composition',
    '🎨',
    '{
      "type": "count",
      "metric": "outfits_created",
      "threshold": 1,
      "query": "SELECT COUNT(*) FROM outfits WHERE user_id = $1 AND is_archived = FALSE"
    }'::jsonb,
    'outfits',
    15
  ),
  (
    'fashion_architect',
    'Fashion Architect',
    'Design 10 unique outfit combinations',
    '🏛️',
    '{
      "type": "count",
      "metric": "outfits_created",
      "threshold": 10,
      "query": "SELECT COUNT(*) FROM outfits WHERE user_id = $1 AND is_archived = FALSE"
    }'::jsonb,
    'outfits',
    30
  ),

  -- Cost-Per-Wear (Value Focus)
  (
    'value_seeker',
    'Value Seeker',
    'Get 5 items to their target cost-per-wear',
    '💎',
    '{
      "type": "count",
      "metric": "items_hit_cpw_target",
      "threshold": 5,
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned'' AND is_archived = FALSE AND wears > 0 AND (COALESCE(purchase_price, retail_price) / wears) <= CASE WHEN COALESCE(purchase_price, retail_price) < 50 THEN 2 WHEN COALESCE(purchase_price, retail_price) < 150 THEN 5 ELSE 10 END"
    }'::jsonb,
    'efficiency',
    20
  ),
  (
    'roi_champion',
    'ROI Champion',
    'Achieve target CPW on 10 items',
    '📈',
    '{
      "type": "count",
      "metric": "items_hit_cpw_target",
      "threshold": 10,
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned'' AND is_archived = FALSE AND wears > 0 AND (COALESCE(purchase_price, retail_price) / wears) <= CASE WHEN COALESCE(purchase_price, retail_price) < 50 THEN 2 WHEN COALESCE(purchase_price, retail_price) < 150 THEN 5 ELSE 10 END"
    }'::jsonb,
    'efficiency',
    40
  ),

  -- Wardrobe Utilization
  (
    'wardrobe_maximizer',
    'Wardrobe Maximizer',
    'Wear 80% of your items at least once this month',
    '🔄',
    '{
      "type": "percentage",
      "metric": "items_worn_this_month",
      "threshold": 80,
      "query": "SELECT COUNT(*) FROM items WHERE user_id = $1 AND status = ''owned'' AND is_archived = FALSE AND last_worn_date >= NOW() - INTERVAL ''30 days''"
    }'::jsonb,
    'efficiency',
    50
  ),

  -- Discovery (Exploration)
  (
    'category_explorer',
    'Category Explorer',
    'Have items in 5 different categories',
    '🧭',
    '{
      "type": "count",
      "metric": "unique_categories",
      "threshold": 5,
      "query": "SELECT COUNT(DISTINCT category) FROM items WHERE user_id = $1 AND status = ''owned'' AND is_archived = FALSE"
    }'::jsonb,
    'discovery',
    15
  ),
  (
    'brand_adventurer',
    'Brand Adventurer',
    'Explore 10 different brands',
    '🌍',
    '{
      "type": "count",
      "metric": "unique_brands",
      "threshold": 10,
      "query": "SELECT COUNT(DISTINCT brand) FROM items WHERE user_id = $1 AND status = ''owned'' AND is_archived = FALSE AND brand IS NOT NULL"
    }'::jsonb,
    'discovery',
    25
  ),

  -- Price Monitoring (Smart Shopping)
  (
    'deal_hunter',
    'Deal Hunter',
    'Save $50 total from price monitoring',
    '🎯',
    '{
      "type": "count",
      "metric": "total_saved_dollars",
      "threshold": 50,
      "query": "SELECT COALESCE(SUM((previous_price - current_price)), 0) FROM price_alerts pa JOIN items i ON pa.item_id = i.id WHERE i.user_id = $1"
    }'::jsonb,
    'efficiency',
    30
  )
ON CONFLICT (achievement_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_emoji = EXCLUDED.icon_emoji,
  unlock_criteria = EXCLUDED.unlock_criteria,
  category = EXCLUDED.category,
  points = EXCLUDED.points;

-- Step 4: Change user_achievements to use achievement_key instead of UUID foreign key
-- Drop both old and new foreign key constraints (idempotent)
ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey;

ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_achievement_key_fkey;

-- Change achievement_id column from UUID to VARCHAR(50) to match achievement_key
-- Use USING clause to handle conversion if column is currently UUID
ALTER TABLE public.user_achievements
  ALTER COLUMN achievement_id TYPE VARCHAR(50) USING achievement_id::VARCHAR(50);

-- Add new foreign key constraint referencing achievement_key
ALTER TABLE public.user_achievements
  ADD CONSTRAINT user_achievements_achievement_key_fkey
  FOREIGN KEY (achievement_id)
  REFERENCES public.achievements(achievement_key)
  ON DELETE CASCADE;

-- Update indexes to reflect the new column type
DROP INDEX IF EXISTS idx_user_achievements_user;
CREATE INDEX idx_user_achievements_user
  ON public.user_achievements(user_id, unlocked_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.user_achievements.achievement_id IS 'References achievements.achievement_key (e.g., wardrobe_starter)';
