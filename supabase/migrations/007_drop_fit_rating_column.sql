-- Migration: Drop fit_rating column from sneakers table
-- Created: 2025-10-01
-- Description: Removes the fit_rating column as it's no longer needed in the application

-- Drop the fit_rating column from sneakers table
ALTER TABLE sneakers DROP COLUMN IF EXISTS fit_rating;

-- Add a comment to document the change
COMMENT ON TABLE sneakers IS 'Sneaker tracking table - fit_rating column removed on 2025-10-01';
