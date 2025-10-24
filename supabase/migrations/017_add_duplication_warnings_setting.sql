-- Migration 017: Add duplication warnings user setting
-- Implements Phase 3: Smart Purchase Prevention feature
-- Allows users to opt-in to duplicate item detection warnings

-- Step 1: Add duplication warnings setting to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS enable_duplication_warnings BOOLEAN DEFAULT FALSE;

-- Step 2: Add cooling-off days user preference to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_cooling_off_days INTEGER DEFAULT 7;

-- Step 3: Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_duplication_warnings
ON profiles(id)
WHERE enable_duplication_warnings = TRUE;

-- Step 4: Document the fields
-- enable_duplication_warnings: Whether user wants duplicate item warnings
--   Off by default (opt-in only)
--   When enabled, shows inline warning on Add Item form if similar item exists
-- preferred_cooling_off_days: User's default cooling-off period (7, 14, or 30 days)
--   Applied to all new wishlist items unless overridden
