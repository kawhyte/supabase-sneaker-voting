-- Migration 020: Add Performance Indexes
--
-- Creates strategic indexes on frequently queried columns to improve query performance
-- Indexes added:
-- 1. sneakers (user_id, status) - Filter items by user and status
-- 2. sneakers (user_id, created_at) - Sort items by date
-- 3. sneakers (brand_id, status) - Filter by brand
-- 4. outfits (user_id, is_archived) - Filter outfits by user
-- 5. outfit_items (outfit_id) - Join outfit items
-- 6. item_photos (item_id, image_order) - Fetch photos in order
-- 7. item_photos (item_id, is_main_image) - Get main image
-- 8. price_monitors (item_id, user_id) - Filter price monitors
-- 9. price_check_log (item_id, created_at) - Query price history

-- Index 1: Filter items by user and status (most common query)
CREATE INDEX IF NOT EXISTS idx_sneakers_user_status
ON sneakers(user_id, status);

-- Index 2: Sort items by user and date
CREATE INDEX IF NOT EXISTS idx_sneakers_user_created
ON sneakers(user_id, created_at DESC);

-- Index 3: Filter items by brand
CREATE INDEX IF NOT EXISTS idx_sneakers_brand_status
ON sneakers(brand_id, status);

-- Index 4: Filter outfits by user (for outfit dashboard)
CREATE INDEX IF NOT EXISTS idx_outfits_user_archived
ON outfits(user_id, is_archived);

-- Index 5: Join outfit items (get items for an outfit)
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit
ON outfit_items(outfit_id);

-- Index 6: Fetch item photos in order (for carousel)
CREATE INDEX IF NOT EXISTS idx_item_photos_item_order
ON item_photos(item_id, image_order);

-- Index 7: Get main image for item (quick lookup)
CREATE INDEX IF NOT EXISTS idx_item_photos_main
ON item_photos(item_id, is_main_image);

-- Index 8: Filter price monitors by item/user
CREATE INDEX IF NOT EXISTS idx_price_monitors_item_user
ON price_monitors(item_id, user_id);

-- Index 9: Query price history by item and date
CREATE INDEX IF NOT EXISTS idx_price_check_log_item_date
ON price_check_log(item_id, created_at DESC);

-- Index 10: Find active price monitors (for background jobs)
CREATE INDEX IF NOT EXISTS idx_price_monitors_active
ON price_monitors(user_id, is_active)
WHERE is_active = true;

-- Index 11: Filter by user and category (for filtering UI)
CREATE INDEX IF NOT EXISTS idx_sneakers_user_category
ON sneakers(user_id, category);

-- Index 12: Search by brand name (for search functionality)
CREATE INDEX IF NOT EXISTS idx_brands_name
ON brands(LOWER(name));

-- Add comment documenting the indexes
COMMENT ON INDEX idx_sneakers_user_status IS 'Primary filter for dashboard - get items by user and status';
COMMENT ON INDEX idx_sneakers_user_created IS 'Sort items by recency for "newest" view';
COMMENT ON INDEX idx_outfits_user_archived IS 'Filter outfits for dashboard and archive view';
COMMENT ON INDEX idx_item_photos_item_order IS 'Display photos in correct order for carousels';
COMMENT ON INDEX idx_price_check_log_item_date IS 'Query price history for trend analysis';
