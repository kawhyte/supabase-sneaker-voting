-- Migration: Add color palette columns for Sneaker Inspiration feature
-- Date: 2025-12-15
-- Description: Adds color_palette (JSONB) and primary_color (TEXT) columns to items table

BEGIN;

-- Add color_palette column to store array of 5 hex color strings
-- Example: ["#FF5733", "#C70039", "#900C3F", "#581845", "#FFC300"]
ALTER TABLE items
ADD COLUMN IF NOT EXISTS color_palette JSONB DEFAULT NULL;

-- Add primary_color column to store the dominant/vibrant color
-- Used for quick filtering and display
ALTER TABLE items
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT NULL;

-- Add comment to document the column structure
COMMENT ON COLUMN items.color_palette IS 'Array of 5 harmonious hex color codes extracted from item image: [Dominant, Grounding, Harmony, Neutral/Light, Pop]';
COMMENT ON COLUMN items.primary_color IS 'Primary/dominant color extracted from item image (hex code)';

-- Create index on primary_color for filtering performance
CREATE INDEX IF NOT EXISTS idx_items_primary_color ON items(primary_color);

-- Create GIN index on color_palette JSONB for advanced queries
CREATE INDEX IF NOT EXISTS idx_items_color_palette ON items USING GIN (color_palette);

COMMIT;
