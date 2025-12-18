-- Migration 054: Secure price_monitors with RLS and migrate to user_id
-- Fixes: Supabase advisor CRITICAL errors for missing RLS on price_monitors and price_history
-- Impact: Breaking change - replaces user_name (string) with user_id (UUID)

BEGIN;

-- ============================================================
-- STEP 1: Backup existing data
-- ============================================================

CREATE TABLE IF NOT EXISTS price_monitors_backup AS
SELECT * FROM price_monitors;

RAISE NOTICE 'Backed up % price_monitors records', (SELECT COUNT(*) FROM price_monitors_backup);

-- ============================================================
-- STEP 2: Drop existing tables (CASCADE to drop FK constraints)
-- ============================================================

DROP TABLE IF EXISTS price_monitors CASCADE;

RAISE NOTICE 'Dropped price_monitors table (CASCADE)';

-- ============================================================
-- STEP 3: Create new secure price_monitors table
-- ============================================================

CREATE TABLE public.price_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,

  -- Product tracking
  product_url TEXT NOT NULL,
  store_name VARCHAR(100) NOT NULL,
  target_price DECIMAL(10, 2),

  -- Status tracking
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  last_price DECIMAL(10, 2),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT FALSE NOT NULL,

  -- Failure tracking (auto-disable after 3 consecutive failures)
  consecutive_failures INTEGER DEFAULT 0 NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT unique_user_product_url UNIQUE(user_id, product_url),
  CONSTRAINT valid_target_price CHECK (target_price IS NULL OR target_price > 0),
  CONSTRAINT valid_last_price CHECK (last_price IS NULL OR last_price >= 0),
  CONSTRAINT valid_consecutive_failures CHECK (consecutive_failures >= 0)
);

RAISE NOTICE 'Created new price_monitors table with user_id';

-- ============================================================
-- STEP 4: Create indexes for performance
-- ============================================================

CREATE INDEX idx_price_monitors_user_id ON price_monitors(user_id);
CREATE INDEX idx_price_monitors_item_id ON price_monitors(item_id);
CREATE INDEX idx_price_monitors_is_active ON price_monitors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_price_monitors_last_checked ON price_monitors(last_checked_at) WHERE is_active = TRUE;

RAISE NOTICE 'Created performance indexes';

-- ============================================================
-- STEP 5: Migrate data from backup
-- ============================================================

-- Migrate records with valid sneaker_id (can map to user_id via items table)
INSERT INTO price_monitors (
  id,
  user_id,
  item_id,
  product_url,
  store_name,
  target_price,
  is_active,
  last_price,
  last_checked_at,
  notification_sent,
  created_at,
  updated_at
)
SELECT
  backup.id,
  items.user_id,
  backup.sneaker_id AS item_id,
  backup.product_url,
  backup.store_name,
  backup.target_price,
  backup.is_active,
  backup.last_price,
  backup.last_checked_at,
  backup.notification_sent,
  backup.created_at,
  backup.updated_at
FROM price_monitors_backup backup
INNER JOIN items ON items.id = backup.sneaker_id
WHERE backup.sneaker_id IS NOT NULL
ON CONFLICT (user_id, product_url) DO NOTHING;

-- Log migration results
DO $$
DECLARE
  migrated_count INTEGER;
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM price_monitors;
  SELECT COUNT(*) INTO orphaned_count FROM price_monitors_backup WHERE sneaker_id IS NULL;

  RAISE NOTICE 'Migrated % records successfully', migrated_count;

  IF orphaned_count > 0 THEN
    RAISE WARNING 'Found % orphaned price_monitors records without sneaker_id - these were not migrated', orphaned_count;
    RAISE NOTICE 'To review orphaned records: SELECT * FROM price_monitors_backup WHERE sneaker_id IS NULL';
  END IF;
END $$;

-- ============================================================
-- STEP 6: Re-add FK from price_history to price_monitors
-- ============================================================

ALTER TABLE price_history
  DROP CONSTRAINT IF EXISTS price_history_monitor_id_fkey;

ALTER TABLE price_history
  ADD CONSTRAINT price_history_monitor_id_fkey
  FOREIGN KEY (monitor_id)
  REFERENCES price_monitors(id)
  ON DELETE CASCADE;

RAISE NOTICE 'Restored FK from price_history to price_monitors';

-- ============================================================
-- STEP 7: Enable RLS on price_monitors
-- ============================================================

ALTER TABLE price_monitors ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only view their own monitors
CREATE POLICY "Users can view their own price monitors"
  ON price_monitors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can only create monitors for items they own
CREATE POLICY "Users can create their own price monitors"
  ON price_monitors FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM items
      WHERE items.id = price_monitors.item_id
      AND items.user_id = auth.uid()
    )
  );

-- UPDATE: Users can only update their own monitors
CREATE POLICY "Users can update their own price monitors"
  ON price_monitors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own monitors
CREATE POLICY "Users can delete their own price monitors"
  ON price_monitors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role: Full access for cron jobs
CREATE POLICY "Service role can manage all price monitors"
  ON price_monitors
  TO service_role
  USING (true)
  WITH CHECK (true);

RAISE NOTICE 'Enabled RLS on price_monitors with 5 policies';

-- ============================================================
-- STEP 8: Enable RLS on price_history
-- ============================================================

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only view price history for their own monitors
CREATE POLICY "Users can view their own price history"
  ON price_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM price_monitors
      WHERE price_monitors.id = price_history.monitor_id
      AND price_monitors.user_id = auth.uid()
    )
  );

-- INSERT: Users can create price history for their own monitors
CREATE POLICY "Users can create their own price history"
  ON price_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM price_monitors
      WHERE price_monitors.id = price_history.monitor_id
      AND price_monitors.user_id = auth.uid()
    )
  );

-- Service role: Full access for cron jobs
CREATE POLICY "Service role can manage all price history"
  ON price_history
  TO service_role
  USING (true)
  WITH CHECK (true);

RAISE NOTICE 'Enabled RLS on price_history with 3 policies';

-- ============================================================
-- STEP 9: Add updated_at trigger
-- ============================================================

CREATE TRIGGER update_price_monitors_updated_at
  BEFORE UPDATE ON price_monitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE 'Added updated_at trigger to price_monitors';

-- ============================================================
-- STEP 10: Cleanup instructions
-- ============================================================

RAISE NOTICE '================================================================';
RAISE NOTICE 'Migration 054 completed successfully!';
RAISE NOTICE '================================================================';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Verify RLS policies in Supabase Dashboard → Table Editor → price_monitors';
RAISE NOTICE '2. Update API routes (app/api/price-monitors/route.ts and app/api/monitor-prices/route.ts)';
RAISE NOTICE '3. Add SUPABASE_SERVICE_ROLE_KEY to .env.local';
RAISE NOTICE '4. Run: npm run db:types';
RAISE NOTICE '5. Keep price_monitors_backup table for 7 days as rollback safety';
RAISE NOTICE '================================================================';

COMMIT;
