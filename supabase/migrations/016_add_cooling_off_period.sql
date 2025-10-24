-- Migration 016: Add cooling-off period fields for purchase prevention
-- Implements Phase 3: Smart Purchase Prevention feature
-- Allows users to enforce a waiting period before purchasing wishlist items

-- Step 1: Add cooling-off period columns to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS cooling_off_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS can_purchase_after TIMESTAMP DEFAULT NULL;

-- Step 2: Create index for efficient queries on wishlist items that can be purchased
CREATE INDEX IF NOT EXISTS idx_items_can_purchase_after
ON items(user_id, status, can_purchase_after)
WHERE status = 'wishlisted';

-- Step 3: Document the fields
-- cooling_off_days: Number of days before item can be purchased (7, 14, or 30)
-- can_purchase_after: ISO timestamp when the item becomes purchasable
-- This timestamp is calculated when item is added to wishlist:
--   can_purchase_after = NOW() + INTERVAL cooling_off_days DAY
