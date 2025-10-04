-- Migration: Add purchase_price field for accurate cost-per-wear tracking
-- Purpose: Track actual amount paid (vs listed price) to enable accurate cost-per-wear calculations
-- Author: Cost-Per-Wear Feature Implementation
-- Date: 2025-01-04

-- ============================================================================
-- ADD PURCHASE PRICE FIELD TO SNEAKERS TABLE
-- ============================================================================

-- Add purchase_price column to track actual paid amount
ALTER TABLE sneakers
  ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2);

-- Add comment for documentation
COMMENT ON COLUMN sneakers.purchase_price IS 'Actual price paid for the sneaker (may differ from retail_price due to sales/discounts). Used for cost-per-wear calculations.';

-- ============================================================================
-- CREATE INDEX FOR PERFORMANCE
-- ============================================================================

-- Index for cost-per-wear queries and analytics
CREATE INDEX IF NOT EXISTS idx_sneakers_purchase_price ON sneakers(purchase_price) WHERE purchase_price IS NOT NULL;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- This migration adds purchase_price field to enable accurate cost-per-wear tracking:
-- - purchase_price: Actual amount paid (may be on sale)
-- - retail_price: Original MSRP/retail price (existing field)
--
-- Cost-per-wear calculation logic:
-- - Primary: Use purchase_price if available
-- - Fallback: Use retail_price if purchase_price is NULL
-- - Show N/A if both are NULL or wears = 0
--
-- Backwards compatibility:
-- - Existing entries will have NULL purchase_price
-- - Will gracefully fall back to retail_price
-- - No data migration required
