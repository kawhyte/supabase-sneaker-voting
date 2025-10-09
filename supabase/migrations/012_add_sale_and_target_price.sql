-- Add sale_price and target_price columns for wishlist price tracking
-- sale_price: Current sale price if the item is on sale
-- target_price: User's desired price point for purchase consideration

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS target_price DECIMAL(10, 2);

-- Add comments for documentation
COMMENT ON COLUMN items.sale_price IS 'Current sale price if item is on sale. Used for wishlist items to show discounts.';
COMMENT ON COLUMN items.target_price IS 'User''s target price for purchase consideration. Helps track when items reach desired price point.';

-- Index for sale price queries (finding items on sale)
CREATE INDEX IF NOT EXISTS idx_items_sale_price
  ON items(sale_price)
  WHERE sale_price IS NOT NULL;

-- Index for target price tracking
CREATE INDEX IF NOT EXISTS idx_items_target_price
  ON items(target_price)
  WHERE target_price IS NOT NULL;

-- Composite index for wishlist items with sale prices
CREATE INDEX IF NOT EXISTS idx_items_wishlist_sale_price
  ON items(status, sale_price)
  WHERE status IN ('wishlisted', 'journaled') AND sale_price IS NOT NULL;
