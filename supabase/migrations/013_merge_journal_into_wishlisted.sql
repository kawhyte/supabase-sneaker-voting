-- Migration 013: Merge Journal (journaled) status into Wishlisted status
-- Purpose: Consolidate 'journaled' status into 'wishlisted' to reduce confusion
-- All journaled items (try-on notes) are moved to wishlist

-- Step 1: Migrate all 'journaled' items to 'wishlisted'
UPDATE items
SET status = 'wishlisted'
WHERE status = 'journaled';

-- Step 2: Update the status check constraint to only allow 'owned' and 'wishlisted'
ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_status_check;

ALTER TABLE items
ADD CONSTRAINT items_status_check
CHECK (status IN ('owned', 'wishlisted'));

-- Step 3: Document the migration
-- This migration consolidates the 'journaled' status into 'wishlisted'
-- because they both represent items the user wants to track but hasn't purchased.
-- The distinction was confusing for users, so we've unified them under 'wishlisted'.
-- Users can still add notes (try-on experiences, sizing reference) to wishlist items.
