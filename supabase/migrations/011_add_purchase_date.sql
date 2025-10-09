-- Migration: Add purchase_date field for purchase tracking
-- Purpose: Track when an item was purchased to complement purchase_price
-- Author: Purchase Confirmation Modal Feature
-- Date: 2025-01-10

-- ============================================================================
-- ADD PURCHASE DATE FIELD TO ITEMS TABLE
-- ============================================================================

-- Add purchase_date column to track when the item was purchased
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN items.purchase_date IS 'Date when the item was purchased. Used together with purchase_price for complete purchase tracking.';

-- ============================================================================
-- CREATE INDEX FOR PERFORMANCE
-- ============================================================================

-- Index for purchase date queries and analytics
CREATE INDEX IF NOT EXISTS idx_items_purchase_date ON items(purchase_date) WHERE purchase_date IS NOT NULL;

-- Composite index for purchased items with date
CREATE INDEX IF NOT EXISTS idx_items_status_purchase_date ON items(status, purchase_date) WHERE status = 'owned';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- This migration adds purchase_date field to enable complete purchase tracking:
-- - purchase_date: When the item was actually purchased
-- - purchase_price: How much was paid (from migration 009)
-- - status: Item status (owned/wishlisted/journaled)
--
-- Use cases:
-- - Track purchase history and spending over time
-- - Calculate cost per wear from purchase date
-- - Generate purchase reports and analytics
-- - Show purchase timeline in collection view
--
-- Backwards compatibility:
-- - Existing entries will have NULL purchase_date
-- - Field is optional to maintain flexibility
-- - No data migration required
-- - Works seamlessly with purchased confirmation modal
