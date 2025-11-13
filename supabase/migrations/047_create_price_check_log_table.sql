-- Migration 047: Create price_check_log table
-- Critical fix: Edge function writes to this table but it doesn't exist
-- This table stores audit logs of all price check attempts (success + failure)

-- Create price_check_log table
CREATE TABLE IF NOT EXISTS price_check_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Price data (NULL if check failed)
  price DECIMAL(10, 2),

  -- Check metadata
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'automated_scrape', -- 'automated_scrape' | 'manual_check' | 'browserless_scrape' | 'user_entry'
  retailer VARCHAR(100), -- Retailer name (e.g., 'Nike', 'Foot Locker')

  -- Success tracking
  success BOOLEAN NOT NULL DEFAULT FALSE,

  -- Error tracking (for failed checks)
  error_message TEXT,
  error_category VARCHAR(50), -- 'network_error' | 'parse_error' | 'bot_detection' | 'timeout' | 'invalid_price' | 'unknown'
  http_status_code INTEGER,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign keys
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE price_check_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Users can view own price check logs" ON price_check_log;
DROP POLICY IF EXISTS "Service role can insert price check logs" ON price_check_log;
DROP POLICY IF EXISTS "Users can insert own price check logs" ON price_check_log;

-- RLS Policy: Users can only view their own price check logs
CREATE POLICY "Users can view own price check logs" ON price_check_log FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert (for edge functions)
CREATE POLICY "Service role can insert price check logs" ON price_check_log FOR INSERT
  WITH CHECK (true); -- Edge function uses service role, always allow

-- RLS Policy: Users can insert their own manual checks
CREATE POLICY "Users can insert own price check logs" ON price_check_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_check_log_item_date
  ON price_check_log(item_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_check_log_user_date
  ON price_check_log(user_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_check_log_success
  ON price_check_log(success, checked_at DESC)
  WHERE success = TRUE;

-- Add comments
COMMENT ON TABLE price_check_log IS 'Audit log of all price check attempts (success and failure)';
COMMENT ON COLUMN price_check_log.source IS 'Where the price check originated: automated_scrape, manual_check, browserless_scrape, user_entry';
COMMENT ON COLUMN price_check_log.error_category IS 'Category of error for failed checks: network_error, parse_error, bot_detection, timeout, invalid_price, unknown';
COMMENT ON INDEX idx_price_check_log_item_date IS 'Query price history for specific items';
COMMENT ON INDEX idx_price_check_log_success IS 'Filter successful checks for analytics';
