-- Migration: Add archive functionality to sneakers table
-- Purpose: Allow users to archive sneakers (sold/donated/worn out) while maintaining history
-- Author: Archive Feature Implementation
-- Date: 2025-01-XX

-- ============================================================================
-- ADD ARCHIVE FIELDS TO SNEAKERS TABLE
-- ============================================================================

-- Add archive status fields and collection tracking fields
ALTER TABLE sneakers
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archive_reason VARCHAR(50),
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS wears INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_worn_date TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN sneakers.is_archived IS 'Indicates if sneaker has been archived (sold/donated/worn out)';
COMMENT ON COLUMN sneakers.archive_reason IS 'Reason for archiving: sold, donated, worn_out, other';
COMMENT ON COLUMN sneakers.archived_at IS 'Timestamp when sneaker was archived';
COMMENT ON COLUMN sneakers.wears IS 'Number of times the sneaker has been worn';
COMMENT ON COLUMN sneakers.last_worn_date IS 'Last date the sneaker was worn';

-- ============================================================================
-- CREATE INDEX FOR EFFICIENT FILTERING
-- ============================================================================

-- Index for quickly filtering active vs archived items
CREATE INDEX IF NOT EXISTS idx_sneakers_archived ON sneakers(is_archived);

-- Composite index for collection queries (in_collection + is_archived)
CREATE INDEX IF NOT EXISTS idx_sneakers_collection_archive ON sneakers(in_collection, is_archived);

-- Index for sorting archived items by date
CREATE INDEX IF NOT EXISTS idx_sneakers_archived_at ON sneakers(archived_at DESC) WHERE is_archived = TRUE;

-- ============================================================================
-- ADD CHECK CONSTRAINT FOR ARCHIVE REASON
-- ============================================================================

-- Drop existing constraint if it exists, then recreate it
ALTER TABLE sneakers DROP CONSTRAINT IF EXISTS check_archive_reason;

-- Ensure archive_reason is one of the valid values if archived
ALTER TABLE sneakers
  ADD CONSTRAINT check_archive_reason
  CHECK (
    (is_archived = FALSE AND archive_reason IS NULL AND archived_at IS NULL)
    OR
    (is_archived = TRUE AND archive_reason IN ('sold', 'donated', 'worn_out', 'other'))
  );

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- This migration adds three new fields to track archive status:
-- 1. is_archived: Boolean flag for quick filtering
-- 2. archive_reason: Categorized reason (sold/donated/worn_out/other)
-- 3. archived_at: Timestamp for sorting and history

-- The check constraint ensures data integrity:
-- - If not archived: all archive fields must be NULL
-- - If archived: archive_reason must be one of the valid values

-- Indexes optimize common queries:
-- - Filter by archive status (active vs archived)
-- - Sort archived items by date
-- - Combined filtering for collection + archive views
