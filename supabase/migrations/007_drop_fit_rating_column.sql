-- ============================================================================
-- Migration: Drop fit_rating column from sneakers table
-- ============================================================================
-- Created: 2025-10-18
-- Version: 1.0
--
-- DESCRIPTION:
-- Removes the fit_rating column from the sneakers table as part of the
-- migration to use comfort_rating for all fit/comfort feedback.
-- This migration completes the UI/UX refactoring to use a modern,
-- intuitive comfort rating system (1-5 scale with descriptive icons).
--
-- CONTEXT:
-- - Application code refactoring complete (all references removed)
-- - TypeScript types updated (fit_rating removed from SizingJournalEntry)
-- - UI components updated (FitProfileDashboard removed)
-- - All tests passing with zero errors
--
-- SAFETY NOTES:
-- - This is a destructive change (column deletion)
-- - Ensure backups are taken before applying this migration
-- - All existing fit_rating data will be permanently deleted
-- - comfort_rating (1-5 scale) is the active replacement
-- - No data recovery is possible after migration completes
--
-- ROLLBACK PLAN (if needed):
-- ALTER TABLE sneakers ADD COLUMN fit_rating INTEGER;
-- However, data cannot be recovered after migration
--
-- ============================================================================

BEGIN;

-- Verify column exists before attempting deletion
-- (IF EXISTS prevents errors if migration runs multiple times)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sneakers' AND column_name='fit_rating'
  ) THEN
    ALTER TABLE sneakers DROP COLUMN fit_rating CASCADE;
    RAISE NOTICE 'Successfully dropped fit_rating column from sneakers table';
  ELSE
    RAISE NOTICE 'fit_rating column does not exist - skipping drop';
  END IF;
END $$;

-- Update table documentation
COMMENT ON TABLE sneakers IS 'Sneaker tracking table - uses comfort_rating (1-5 scale) for fit/comfort feedback. fit_rating column removed on 2025-10-18.';

-- Verify migration success
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sneakers' AND column_name='fit_rating'
  ) THEN
    RAISE NOTICE 'Migration 007 verified: fit_rating column successfully removed';
  ELSE
    RAISE EXCEPTION 'Migration 007 failed: fit_rating column still exists!';
  END IF;
END $$;

COMMIT;
