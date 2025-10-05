-- Migration: Add Item Categories and Rename Tables
-- Description: Transform sneaker-only app to support multiple wardrobe categories
-- Categories: shoes, tops, bottoms, outerwear, accessories, jewelry, watches

-- ============================================================================
-- STEP 1: Add new columns to existing sneakers table
-- ============================================================================

-- Add category column (default to 'shoes' for all existing data)
ALTER TABLE sneakers ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'shoes';

-- Add purchased status for non-shoe items
ALTER TABLE sneakers ADD COLUMN IF NOT EXISTS is_purchased BOOLEAN DEFAULT false;

-- Add size type to distinguish between shoe sizes and clothing sizes
ALTER TABLE sneakers ADD COLUMN IF NOT EXISTS size_type TEXT DEFAULT 'shoe';

-- ============================================================================
-- STEP 2: Add constraints for data integrity
-- ============================================================================

-- Enforce valid categories
ALTER TABLE sneakers ADD CONSTRAINT category_check
  CHECK (category IN ('shoes', 'tops', 'bottoms', 'outerwear', 'accessories', 'jewelry', 'watches'));

-- Enforce valid size types
ALTER TABLE sneakers ADD CONSTRAINT size_type_check
  CHECK (size_type IN ('shoe', 'clothing', 'onesize'));

-- Business rule: Only shoes can be in collection
ALTER TABLE sneakers ADD CONSTRAINT collection_shoes_only
  CHECK (in_collection = false OR (in_collection = true AND category = 'shoes'));

-- Business rule: Only shoes can have wears tracking
ALTER TABLE sneakers ADD CONSTRAINT wears_shoes_only
  CHECK (wears IS NULL OR (wears IS NOT NULL AND category = 'shoes'));

-- Business rule: Only non-shoes can be marked as purchased
ALTER TABLE sneakers ADD CONSTRAINT purchased_non_shoes_only
  CHECK (is_purchased = false OR (is_purchased = true AND category != 'shoes'));

-- Business rule: Fit rating only for shoes
ALTER TABLE sneakers ADD CONSTRAINT fit_rating_shoes_only
  CHECK (fit_rating IS NULL OR (fit_rating IS NOT NULL AND category = 'shoes'));

-- Business rule: Size type must match category
ALTER TABLE sneakers ADD CONSTRAINT size_type_category_match
  CHECK (
    (category = 'shoes' AND size_type = 'shoe') OR
    (category IN ('tops', 'bottoms', 'outerwear') AND (size_type = 'clothing' OR size_type = 'onesize')) OR
    (category IN ('accessories', 'jewelry', 'watches') AND (size_type = 'onesize' OR size_type = 'clothing'))
  );

-- ============================================================================
-- STEP 3: Rename tables for semantic correctness
-- ============================================================================

-- Rename sneakers to items
ALTER TABLE sneakers RENAME TO items;

-- Rename sneaker_photos to item_photos
ALTER TABLE sneaker_photos RENAME TO item_photos;

-- Rename foreign key column
ALTER TABLE item_photos RENAME COLUMN sneaker_id TO item_id;

-- ============================================================================
-- STEP 4: Update indexes for performance
-- ============================================================================

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- Create index on purchased status
CREATE INDEX IF NOT EXISTS idx_items_purchased ON items(is_purchased);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_items_category_collection ON items(category, in_collection) WHERE is_archived = false;

-- Create composite index for purchased items
CREATE INDEX IF NOT EXISTS idx_items_category_purchased ON items(category, is_purchased) WHERE is_archived = false;

-- ============================================================================
-- STEP 5: Update existing data
-- ============================================================================

-- Ensure all existing items have correct defaults
UPDATE items
SET
  category = 'shoes',
  size_type = 'shoe',
  is_purchased = false
WHERE category IS NULL OR category = 'sneakers';

-- ============================================================================
-- STEP 6: Add helpful comments
-- ============================================================================

COMMENT ON TABLE items IS 'Stores all wardrobe items: shoes, clothing, and accessories';
COMMENT ON COLUMN items.category IS 'Item category: shoes, tops, bottoms, outerwear, accessories, jewelry, watches';
COMMENT ON COLUMN items.is_purchased IS 'For non-shoe items: whether the item has been purchased';
COMMENT ON COLUMN items.size_type IS 'Size measurement system: shoe (US/EU), clothing (S/M/L), or onesize';
COMMENT ON COLUMN items.in_collection IS 'For shoes only: whether the item is in the physical collection';
COMMENT ON COLUMN items.wears IS 'For shoes only: number of times worn';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- ✅ Added category, is_purchased, size_type columns
-- ✅ Renamed sneakers → items, sneaker_photos → item_photos
-- ✅ Added data integrity constraints
-- ✅ Created performance indexes
-- ✅ Updated existing data to category='shoes'
-- ============================================================================
