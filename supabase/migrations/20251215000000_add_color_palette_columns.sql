-- Migration: Add color palette columns for Sneaker Inspiration feature
-- Date: 2025-12-15
-- Description: Adds color_palette (JSONB) and primary_color (TEXT) columns to items table

BEGIN;

-- Add color_palette column to store dual-vibe palette object
-- Example: { "bold": ["#FF5733", "#C70039", "#900C3F", "#581845", "#FFC300"], "muted": ["#8B7355", "#A0826D", "#B8956A", "#C9B38C", "#D4C5A9"] }
ALTER TABLE items
ADD COLUMN IF NOT EXISTS color_palette JSONB DEFAULT NULL;

-- Add primary_color column to store the dominant/vibrant color
-- Used for quick filtering and display
ALTER TABLE items
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT NULL;

-- Add comment to document the column structure
COMMENT ON COLUMN items.color_palette IS 'Dual-vibe color palette object with "bold" and "muted" arrays, each containing 5 hex color codes: { bold: string[], muted: string[] }';
COMMENT ON COLUMN items.primary_color IS 'Primary/dominant color extracted from item image (hex code)';

-- Create index on primary_color for filtering performance
CREATE INDEX IF NOT EXISTS idx_items_primary_color ON items(primary_color);

-- Create GIN index on color_palette JSONB for advanced queries
CREATE INDEX IF NOT EXISTS idx_items_color_palette ON items USING GIN (color_palette);

COMMIT;
