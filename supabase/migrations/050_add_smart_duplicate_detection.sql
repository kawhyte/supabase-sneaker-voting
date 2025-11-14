-- Migration 050: Add Smart Duplicate Detection Settings
-- Implements improved duplicate detection with fuzzy matching and weighted scoring
--
-- Changes:
-- 1. Add enable_similar_item_warnings column (default: TRUE)
-- 2. Update enable_duplication_warnings default to TRUE (both features ON by default)
--
-- Two-tier detection system:
-- - Exact duplicates (≥85% similarity): Catches typos and variations
-- - Similar items (60-84% similarity): Catches "might be duplicates"

-- Step 1: Add similar item warnings setting
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS enable_similar_item_warnings BOOLEAN DEFAULT TRUE;

-- Step 2: Update default for exact duplicate warnings to TRUE
-- (Only affects new users, existing users keep their current setting)
ALTER TABLE profiles
ALTER COLUMN enable_duplication_warnings SET DEFAULT TRUE;

-- Step 3: Update existing NULL values to TRUE (enable by default for all users)
UPDATE profiles
SET enable_duplication_warnings = TRUE
WHERE enable_duplication_warnings IS NULL;

UPDATE profiles
SET enable_similar_item_warnings = TRUE
WHERE enable_similar_item_warnings IS NULL;

-- Step 4: Create index for efficient queries when both settings are enabled
CREATE INDEX IF NOT EXISTS idx_profiles_smart_duplication
ON profiles(id)
WHERE enable_duplication_warnings = TRUE OR enable_similar_item_warnings = TRUE;

-- Step 5: Document the fields
COMMENT ON COLUMN profiles.enable_duplication_warnings IS
  'Exact Duplicate Detection (≥85% similarity): Warns when adding items that are nearly identical (e.g., "Black Nike Hoodie" vs "Black Nike Hoody"). Default: TRUE.';

COMMENT ON COLUMN profiles.enable_similar_item_warnings IS
  'Similar Item Detection (60-84% similarity): Warns when adding items that are very similar but not exact duplicates (e.g., "Charcoal Nike Hoodie" vs "Dark Grey Nike Hoodie"). Default: TRUE.';

-- Note: Smart detection uses weighted scoring:
-- - Category: 40% weight (must match for item to be considered similar)
-- - Color: 30% weight (important for distinguishing colorways)
-- - Brand: 20% weight (helps identify duplicates across typos)
-- - Model: 10% weight (least important, often has variations)
--
-- Edge cases handled:
-- - Same brand + different colors = NOT duplicate (colorway variation)
-- - Same brand + same model + same color = duplicate (limited edition re-releases)
