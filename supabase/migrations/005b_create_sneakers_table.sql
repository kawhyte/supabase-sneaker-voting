-- Migration: Create sneakers table (personal wardrobe tracking)
-- This is the user-scoped wardrobe table, distinct from the global products catalog.
-- Renamed to 'items' in migration 010_add_item_categories.sql.

CREATE TABLE IF NOT EXISTS sneakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    sku TEXT,
    color TEXT,
    image_url TEXT,
    cloudinary_id TEXT,
    retail_price DECIMAL(10,2),
    fit_rating INTEGER CHECK (fit_rating BETWEEN 1 AND 5),
    comfort_rating INTEGER CHECK (comfort_rating BETWEEN 1 AND 5),
    in_collection BOOLEAN NOT NULL DEFAULT false,
    has_been_tried BOOLEAN NOT NULL DEFAULT false,
    size_tried TEXT,
    try_on_date TIMESTAMPTZ,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'wishlisted' CHECK (status IN ('owned', 'wishlisted', 'journaled')),
    product_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sneakers_user_id ON sneakers(user_id);
CREATE INDEX IF NOT EXISTS idx_sneakers_in_collection ON sneakers(in_collection);
CREATE INDEX IF NOT EXISTS idx_sneakers_status ON sneakers(status);

ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sneakers"
ON sneakers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sneakers"
ON sneakers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sneakers"
ON sneakers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sneakers"
ON sneakers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- update_updated_at_column() is defined in migration 001_create_core_tables.sql
CREATE TRIGGER update_sneakers_updated_at
BEFORE UPDATE ON sneakers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
