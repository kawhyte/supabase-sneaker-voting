-- Migration 054: Drop outfit tables
-- Outfit Studio has been removed from the app. These tables are no longer used.

BEGIN;

-- Drop outfit_items first (has FK referencing outfits)
DROP TABLE IF EXISTS outfit_items CASCADE;

-- Drop outfits
DROP TABLE IF EXISTS outfits CASCADE;

COMMIT;
