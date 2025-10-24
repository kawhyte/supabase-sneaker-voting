-- ============================================================================
-- COMPREHENSIVE MIGRATION SCRIPT
-- Applies all Phase 3 (Smart Purchase Prevention) and Phase 4 (Outfit Visualization)
-- migrations in the correct order
--
-- Run this ONCE in your Supabase SQL Editor to set up the complete database
-- ============================================================================

-- ============================================================================
-- MIGRATION 014: Create outfits table (Phase 4)
-- ============================================================================
-- Purpose: Store user-created outfit combinations with visual layout data

CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Outfit metadata
  name TEXT NOT NULL DEFAULT 'Untitled Outfit',
  description TEXT,
  occasion TEXT, -- 'casual', 'work', 'date', 'gym', 'formal', 'travel', etc.

  -- Visual composition
  background_color TEXT DEFAULT '#FFFFFF', -- Background within phone mockup

  -- Wear tracking
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_worn TIMESTAMP WITH TIME ZONE, -- When user marked this outfit as worn
  times_worn INT DEFAULT 0, -- How many times this outfit has been worn
  last_worn TIMESTAMP WITH TIME ZONE,

  -- Status
  is_archived BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own outfits
CREATE POLICY "Users can view own outfits" ON outfits FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create outfits
CREATE POLICY "Users can create outfits" ON outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own outfits
CREATE POLICY "Users can update own outfits" ON outfits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own outfits
CREATE POLICY "Users can delete own outfits" ON outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfits_created_at ON outfits(created_at DESC);
CREATE INDEX idx_outfits_occasion ON outfits(occasion);

-- ============================================================================
-- MIGRATION 015: Create outfit_items table (Phase 4)
-- ============================================================================
-- Purpose: Track which items are in an outfit and their visual positioning

CREATE TABLE IF NOT EXISTS outfit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  -- Visual positioning (for phone mockup canvas)
  position_x NUMERIC DEFAULT 0.5, -- 0.0 to 1.0 (percentage of width)
  position_y NUMERIC DEFAULT 0.5, -- 0.0 to 1.0 (percentage of height)
  z_index INT DEFAULT 0, -- Layer order (0=shoes, 1=bottoms, 2=tops, 3=outerwear, 4=accessories)

  -- Photo crop data (for outfit-specific cropping)
  crop_x NUMERIC, -- Crop origin X (0-1)
  crop_y NUMERIC, -- Crop origin Y (0-1)
  crop_width NUMERIC, -- Crop width (0-1)
  crop_height NUMERIC, -- Crop height (0-1)
  cropped_image_url TEXT, -- URL of cropped version (stored in Cloudinary)

  -- Display size on canvas
  display_width NUMERIC DEFAULT 0.3, -- Width as % of canvas (0.1 to 1.0)
  display_height NUMERIC DEFAULT 0.3, -- Height as % of canvas (0.1 to 1.0)

  -- Order in the outfit
  item_order INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (inherit from outfit through outfit_id)
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view outfit items for their outfits
CREATE POLICY "Users can view outfit items" ON outfit_items FOR SELECT
  USING (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can create outfit items for their outfits
CREATE POLICY "Users can create outfit items" ON outfit_items FOR INSERT
  WITH CHECK (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update outfit items for their outfits
CREATE POLICY "Users can update outfit items" ON outfit_items FOR UPDATE
  USING (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete outfit items from their outfits
CREATE POLICY "Users can delete outfit items" ON outfit_items FOR DELETE
  USING (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_item_id ON outfit_items(item_id);
CREATE UNIQUE INDEX idx_outfit_items_unique ON outfit_items(outfit_id, item_id);

-- ============================================================================
-- MIGRATION 016: Add cooling-off period fields (Phase 3)
-- ============================================================================
-- Purpose: Add cooling-off period columns for smart purchase prevention

ALTER TABLE items
ADD COLUMN IF NOT EXISTS cooling_off_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS can_purchase_after TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient wishlist queries
CREATE INDEX IF NOT EXISTS idx_items_can_purchase_after ON items(can_purchase_after);

-- ============================================================================
-- MIGRATION 017: Add duplication warnings setting (Phase 3)
-- ============================================================================
-- Purpose: Add user preferences for duplication detection and cooling-off periods

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS enable_duplication_warnings BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_cooling_off_days INTEGER DEFAULT 7;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_duplication_warnings ON profiles(enable_duplication_warnings);

-- ============================================================================
-- MIGRATION 018: Add price tracking fields (Phase 3)
-- ============================================================================
-- Purpose: Track price history and stale price detection

ALTER TABLE items
ADD COLUMN IF NOT EXISTS lowest_price_seen DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS auto_price_tracking_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS price_check_failures INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_price_check_at TIMESTAMP WITH TIME ZONE;

-- Create price_history table for tracking price changes over time
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Price data
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Source of price check
  source TEXT DEFAULT 'automated_scrape', -- 'automated_scrape', 'manual_entry', 'imported'

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for price_history
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own price history
CREATE POLICY "Users can view own price history" ON price_history FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create price history entries
CREATE POLICY "Users can create price history" ON price_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_last_price_check_at ON items(last_price_check_at);
CREATE INDEX IF NOT EXISTS idx_items_auto_price_tracking ON items(auto_price_tracking_enabled);
CREATE INDEX IF NOT EXISTS idx_price_history_item_id ON price_history(item_id);
CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_checked_at ON price_history(checked_at DESC);

-- ============================================================================
-- VERIFICATION SECTION
-- ============================================================================
-- Run these queries to verify all migrations applied successfully

-- Check 1: Verify all tables exist
SELECT
  'TABLE VERIFICATION' as check_type,
  COUNT(*) as count,
  string_agg(table_name, ', ') as tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('outfits', 'outfit_items', 'items', 'profiles', 'price_history');

-- Check 2: Verify outfits columns
SELECT
  'outfits columns' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'outfits'
AND column_name IN ('id', 'user_id', 'name', 'occasion', 'times_worn', 'is_archived');

-- Check 3: Verify outfit_items columns
SELECT
  'outfit_items columns' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'outfit_items'
AND column_name IN ('id', 'outfit_id', 'item_id', 'position_x', 'position_y', 'z_index', 'display_width', 'display_height');

-- Check 4: Verify items Phase 3 columns
SELECT
  'items Phase 3 columns' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'items'
AND column_name IN ('cooling_off_days', 'can_purchase_after', 'lowest_price_seen', 'auto_price_tracking_enabled', 'last_price_check_at', 'price_check_failures');

-- Check 5: Verify profiles Phase 3 columns
SELECT
  'profiles Phase 3 columns' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('enable_duplication_warnings', 'preferred_cooling_off_days');

-- Check 6: Verify RLS policies are enabled
SELECT
  'RLS POLICIES' as check_type,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('outfits', 'outfit_items', 'price_history');

-- Check 7: Verify indexes are created
SELECT
  'INDEXES CREATED' as check_type,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('outfits', 'outfit_items', 'items', 'profiles', 'price_history');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT
  '✅ Phase 3 & 4 Migrations Complete!' as status,
  'Smart Purchase Prevention + Outfit Visualization ready!' as message,
  NOW() as applied_at;
