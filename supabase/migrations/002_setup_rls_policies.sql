-- SoleTracker RLS (Row Level Security) Policies
-- Migration: Set up security policies for user data protection

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- Products are public - everyone can read, only authenticated users can suggest edits
-- ============================================================================

-- Allow everyone to read products
CREATE POLICY "Products are publicly readable"
ON products FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert/update products (for admin/content management)
CREATE POLICY "Authenticated users can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- USERS_EXTENDED TABLE POLICIES
-- Users can only access their own extended profile data
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users_extended FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
ON users_extended FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users_extended FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON users_extended FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ============================================================================
-- STORES TABLE POLICIES
-- Stores are publicly readable, only admin can modify
-- ============================================================================

-- Allow everyone to read stores
CREATE POLICY "Stores are publicly readable"
ON stores FOR SELECT
TO public
USING (active = true);

-- Only authenticated users can modify stores (admin functionality)
CREATE POLICY "Authenticated users can manage stores"
ON stores FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- WATCHLIST TABLE POLICIES
-- Users can only access their own watchlist items
-- ============================================================================

-- Users can view their own watchlist
CREATE POLICY "Users can view own watchlist"
ON watchlist FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can add to their own watchlist
CREATE POLICY "Users can create own watchlist items"
ON watchlist FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own watchlist
CREATE POLICY "Users can update own watchlist items"
ON watchlist FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own watchlist
CREATE POLICY "Users can delete own watchlist items"
ON watchlist FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PRICE_HISTORY TABLE POLICIES
-- Price history is publicly readable (for charts/trends)
-- Only authenticated users/services can insert price data
-- ============================================================================

-- Allow everyone to read price history
CREATE POLICY "Price history is publicly readable"
ON price_history FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert price data (price scraping service)
CREATE POLICY "Authenticated users can insert price data"
ON price_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update price data
CREATE POLICY "Authenticated users can update price data"
ON price_history FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PRICE_ALERTS TABLE POLICIES
-- Users can only see alerts for their watchlist items
-- ============================================================================

-- Users can view alerts for their watchlist items
CREATE POLICY "Users can view own price alerts"
ON price_alerts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM watchlist
        WHERE watchlist.id = price_alerts.watchlist_id
        AND watchlist.user_id = auth.uid()
    )
);

-- System can create alerts for any watchlist item
CREATE POLICY "System can create price alerts"
ON price_alerts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update notification status of their alerts
CREATE POLICY "Users can update own price alerts"
ON price_alerts FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM watchlist
        WHERE watchlist.id = price_alerts.watchlist_id
        AND watchlist.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM watchlist
        WHERE watchlist.id = price_alerts.watchlist_id
        AND watchlist.user_id = auth.uid()
    )
);

-- ============================================================================
-- FUNCTIONS FOR COMMON QUERIES
-- ============================================================================

-- Function to get lowest current price for a product
CREATE OR REPLACE FUNCTION get_lowest_price(product_uuid UUID, size_param VARCHAR DEFAULT NULL)
RETURNS TABLE (
    lowest_price DECIMAL(10,2),
    store_name VARCHAR(100),
    store_id UUID,
    url TEXT,
    in_stock BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (ph.product_id)
        COALESCE(ph.sale_price, ph.price) as lowest_price,
        s.name as store_name,
        s.id as store_id,
        ph.url,
        ph.in_stock
    FROM price_history ph
    JOIN stores s ON ph.store_id = s.id
    WHERE ph.product_id = product_uuid
        AND (size_param IS NULL OR ph.size = size_param)
        AND ph.in_stock = true
        AND ph.checked_at >= (NOW() - INTERVAL '7 days') -- Only recent prices
    ORDER BY ph.product_id, COALESCE(ph.sale_price, ph.price) ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get price history for a product
CREATE OR REPLACE FUNCTION get_price_trend(product_uuid UUID, size_param VARCHAR DEFAULT NULL, days INTEGER DEFAULT 30)
RETURNS TABLE (
    checked_at TIMESTAMPTZ,
    price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    store_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ph.checked_at,
        ph.price,
        ph.sale_price,
        s.name as store_name
    FROM price_history ph
    JOIN stores s ON ph.store_id = s.id
    WHERE ph.product_id = product_uuid
        AND (size_param IS NULL OR ph.size = size_param)
        AND ph.checked_at >= (NOW() - (days || ' days')::INTERVAL)
    ORDER BY ph.checked_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger price alerts
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS void AS $$
DECLARE
    watchlist_item RECORD;
    current_price RECORD;
BEGIN
    -- Loop through all watchlist items with target prices
    FOR watchlist_item IN
        SELECT w.id, w.user_id, w.product_id, w.ideal_size, w.target_price
        FROM watchlist w
        WHERE w.target_price IS NOT NULL
    LOOP
        -- Get current lowest price for this product/size
        SELECT * INTO current_price
        FROM get_lowest_price(watchlist_item.product_id, watchlist_item.ideal_size);

        -- If current price is at or below target, create alert
        IF current_price.lowest_price IS NOT NULL AND current_price.lowest_price <= watchlist_item.target_price THEN
            -- Check if we haven't already sent this alert recently
            IF NOT EXISTS (
                SELECT 1 FROM price_alerts pa
                WHERE pa.watchlist_id = watchlist_item.id
                AND pa.price = current_price.lowest_price
                AND pa.triggered_at >= (NOW() - INTERVAL '1 day')
            ) THEN
                -- Create new alert
                INSERT INTO price_alerts (watchlist_id, price, store_id, notified)
                VALUES (watchlist_item.id, current_price.lowest_price, current_price.store_id, false);
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;