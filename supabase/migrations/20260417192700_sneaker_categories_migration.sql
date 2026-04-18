BEGIN;

-- 1. Drop old constraints tied to the generic clothing category system
ALTER TABLE items DROP CONSTRAINT IF EXISTS category_check;
ALTER TABLE items DROP CONSTRAINT IF EXISTS collection_shoes_only;
ALTER TABLE items DROP CONSTRAINT IF EXISTS wears_shoes_only;
ALTER TABLE items DROP CONSTRAINT IF EXISTS purchased_non_shoes_only;
ALTER TABLE items DROP CONSTRAINT IF EXISTS fit_rating_shoes_only;
ALTER TABLE items DROP CONSTRAINT IF EXISTS size_type_category_match;

-- 2. Map legacy category values to sneaker categories
--    Generic 'shoes' rows → 'lifestyle' (most general sneaker subcategory)
UPDATE items SET category = 'lifestyle' WHERE category = 'shoes';
--    Any remaining legacy clothing rows → 'other'
UPDATE items
SET category = 'other'
WHERE category IN ('tops', 'bottoms', 'outerwear', 'accessories', 'jewelry', 'watches');

-- 3. Enforce the new sneaker-only categories
ALTER TABLE items
  ADD CONSTRAINT category_check
  CHECK (category IN ('lifestyle', 'running', 'basketball', 'skate', 'training', 'boots', 'other'));

COMMIT;
