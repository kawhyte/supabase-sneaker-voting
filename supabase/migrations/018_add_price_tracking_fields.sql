-- Migration 018: Add price tracking fields for automated price monitoring
-- Implements Phase 3: Smart Purchase Prevention feature
-- Enables weekly price checks, price history, and stale price warnings

-- Step 1: Add price tracking columns to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS lowest_price_seen DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS auto_price_tracking_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS price_check_failures INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_price_check_at TIMESTAMP DEFAULT NULL;

-- Step 2: Create price_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  user_id UUID NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  checked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'automated_scrape',
  created_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 3: Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_price_history_item_id
ON price_history(item_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_user_id
ON price_history(user_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_items_price_tracking
ON items(user_id, status, auto_price_tracking_enabled)
WHERE status = 'wishlisted' AND auto_price_tracking_enabled = TRUE;

-- Step 4: Document the fields
-- lowest_price_seen: Lowest price ever recorded for this item
--   Updated by automated weekly price checks
-- auto_price_tracking_enabled: Whether this item should be price tracked
--   Disabled if scraping fails 3+ times
-- price_check_failures: Number of consecutive failed price checks
--   Reset to 0 on successful check
--   If reaches 3, auto_price_tracking_enabled is set to FALSE
-- last_price_check_at: ISO timestamp of last successful price check
--   Used to calculate "stale data" warning (14+ days = stale)
