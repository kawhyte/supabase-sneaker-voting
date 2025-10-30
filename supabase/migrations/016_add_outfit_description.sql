-- Migration: Add description field to outfits table
-- Created: 2025-10-29
-- Purpose: Allow users to add 500-character descriptions to outfits

-- Add description column
ALTER TABLE outfits
ADD COLUMN description TEXT;

-- Add check constraint for 500 character limit
ALTER TABLE outfits
ADD CONSTRAINT outfits_description_length
CHECK (length(description) <= 500);

-- Add comment for documentation
COMMENT ON COLUMN outfits.description IS 'User-provided outfit description (max 500 characters)';
