-- SoleTracker Test Data and Queries
-- Migration: Insert sample data and create test queries for validation

-- ============================================================================
-- INSERT SAMPLE PRICE HISTORY DATA
-- ============================================================================

-- Get the product and store IDs for sample data
DO $$
DECLARE
    jordan_id UUID;
    dunk_id UUID;
    af1_id UUID;
    nike_store_id UUID;
    snipes_store_id UUID;
    footlocker_store_id UUID;
BEGIN
    -- Get product IDs
    SELECT id INTO jordan_id FROM products WHERE sku = 'DZ5485-612';
    SELECT id INTO dunk_id FROM products WHERE sku = 'DD1391-100';
    SELECT id INTO af1_id FROM products WHERE sku = 'CW2288-111';

    -- Get store IDs
    SELECT id INTO nike_store_id FROM stores WHERE domain = 'nike.com';
    SELECT id INTO snipes_store_id FROM stores WHERE domain = 'snipesusa.com';
    SELECT id INTO footlocker_store_id FROM stores WHERE domain = 'footlocker.com';

    -- Insert sample price history for Jordan 1 Chicago Lost and Found
    INSERT INTO price_history (product_id, store_id, size, price, sale_price, in_stock, url, checked_at) VALUES
    -- Nike prices over time
    (jordan_id, nike_store_id, '9.5', 180.00, NULL, true, 'https://nike.com/jordan-1-chicago', NOW() - INTERVAL '7 days'),
    (jordan_id, nike_store_id, '10', 180.00, NULL, true, 'https://nike.com/jordan-1-chicago', NOW() - INTERVAL '7 days'),
    (jordan_id, nike_store_id, '11', 180.00, NULL, false, 'https://nike.com/jordan-1-chicago', NOW() - INTERVAL '7 days'),

    -- Snipes prices (higher due to resell market)
    (jordan_id, snipes_store_id, '9.5', 250.00, NULL, true, 'https://snipesusa.com/jordan-1-chicago', NOW() - INTERVAL '5 days'),
    (jordan_id, snipes_store_id, '10', 275.00, NULL, true, 'https://snipesusa.com/jordan-1-chicago', NOW() - INTERVAL '5 days'),

    -- Foot Locker prices
    (jordan_id, footlocker_store_id, '9.5', 180.00, NULL, false, 'https://footlocker.com/jordan-1-chicago', NOW() - INTERVAL '3 days'),
    (jordan_id, footlocker_store_id, '10', 180.00, NULL, false, 'https://footlocker.com/jordan-1-chicago', NOW() - INTERVAL '3 days');

    -- Insert sample price history for Dunk Low Panda
    INSERT INTO price_history (product_id, store_id, size, price, sale_price, in_stock, url, checked_at) VALUES
    -- Nike prices
    (dunk_id, nike_store_id, '9', 110.00, NULL, true, 'https://nike.com/dunk-low-panda', NOW() - INTERVAL '2 days'),
    (dunk_id, nike_store_id, '9.5', 110.00, NULL, true, 'https://nike.com/dunk-low-panda', NOW() - INTERVAL '2 days'),
    (dunk_id, nike_store_id, '10', 110.00, NULL, true, 'https://nike.com/dunk-low-panda', NOW() - INTERVAL '2 days'),

    -- Snipes prices (resell)
    (dunk_id, snipes_store_id, '9', 150.00, 135.00, true, 'https://snipesusa.com/dunk-low-panda', NOW() - INTERVAL '1 day'),
    (dunk_id, snipes_store_id, '9.5', 160.00, 145.00, true, 'https://snipesusa.com/dunk-low-panda', NOW() - INTERVAL '1 day'),

    -- Foot Locker prices
    (dunk_id, footlocker_store_id, '9', 110.00, NULL, false, 'https://footlocker.com/dunk-low-panda', NOW() - INTERVAL '1 day');

    -- Insert sample price history for Air Force 1
    INSERT INTO price_history (product_id, store_id, size, price, sale_price, in_stock, url, checked_at) VALUES
    -- Nike prices (always available)
    (af1_id, nike_store_id, '9', 90.00, NULL, true, 'https://nike.com/air-force-1', NOW()),
    (af1_id, nike_store_id, '9.5', 90.00, NULL, true, 'https://nike.com/air-force-1', NOW()),
    (af1_id, nike_store_id, '10', 90.00, NULL, true, 'https://nike.com/air-force-1', NOW()),
    (af1_id, nike_store_id, '10.5', 90.00, NULL, true, 'https://nike.com/air-force-1', NOW()),

    -- Foot Locker prices (on sale)
    (af1_id, footlocker_store_id, '9', 90.00, 75.00, true, 'https://footlocker.com/air-force-1', NOW()),
    (af1_id, footlocker_store_id, '9.5', 90.00, 75.00, true, 'https://footlocker.com/air-force-1', NOW()),
    (af1_id, footlocker_store_id, '10', 90.00, 75.00, true, 'https://footlocker.com/air-force-1', NOW());
END $$;

-- ============================================================================
-- CREATE TEST USER PROFILE (requires auth.users to exist first)
-- ============================================================================

-- Note: This would typically be handled by your application's auth flow
-- For testing, you would create a user through Supabase Auth first

-- ============================================================================
-- TEST QUERIES FOR VALIDATION
-- ============================================================================

-- Test Query 1: Get all products with their lowest current prices
-- Expected: Should show products with their cheapest available prices
SELECT
    p.sku,
    p.brand,
    p.model,
    p.colorway,
    clp.size,
    clp.current_price,
    clp.store_name,
    clp.in_stock
FROM products p
LEFT JOIN current_lowest_prices clp ON p.id = clp.product_id
ORDER BY p.brand, p.model, clp.size;

-- Test Query 2: Get price history for Jordan 1 Chicago
-- Expected: Should show price trends across different stores and sizes
SELECT
    p.sku,
    p.model,
    s.name as store,
    ph.size,
    ph.price,
    ph.sale_price,
    ph.in_stock,
    ph.checked_at
FROM price_history ph
JOIN products p ON ph.product_id = p.id
JOIN stores s ON ph.store_id = s.id
WHERE p.sku = 'DZ5485-612'
ORDER BY ph.checked_at DESC, ph.size;

-- Test Query 3: Test the get_lowest_price function
-- Expected: Should return the cheapest available price for Dunk Low in size 9.5
SELECT * FROM get_lowest_price(
    (SELECT id FROM products WHERE sku = 'DD1391-100'),
    '9.5'
);

-- Test Query 4: Test price trend function
-- Expected: Should show price history over the last 30 days
SELECT * FROM get_price_trend(
    (SELECT id FROM products WHERE sku = 'DZ5485-612'),
    '10',
    30
);

-- Test Query 5: Check store data
-- Expected: Should show all 5 stores with their configuration
SELECT
    name,
    domain,
    free_shipping_threshold,
    active,
    jsonb_pretty(selector_rules) as rules
FROM stores
WHERE active = true
ORDER BY name;

-- ============================================================================
-- PERFORMANCE TEST QUERIES
-- ============================================================================

-- Test index performance on price lookups
EXPLAIN ANALYZE
SELECT
    p.model,
    ph.size,
    MIN(COALESCE(ph.sale_price, ph.price)) as lowest_price
FROM products p
JOIN price_history ph ON p.id = ph.product_id
WHERE ph.in_stock = true
    AND ph.checked_at >= (NOW() - INTERVAL '7 days')
GROUP BY p.id, p.model, ph.size
ORDER BY p.model, ph.size;

-- Test watchlist query performance (would need actual user data)
EXPLAIN ANALYZE
SELECT COUNT(*) FROM watchlist w
JOIN products p ON w.product_id = p.id;

-- ============================================================================
-- DATA VALIDATION QUERIES
-- ============================================================================

-- Validate foreign key relationships
-- Should return 0 for all
SELECT
    'Orphaned price history records' as check_type,
    COUNT(*) as error_count
FROM price_history ph
LEFT JOIN products p ON ph.product_id = p.id
LEFT JOIN stores s ON ph.store_id = s.id
WHERE p.id IS NULL OR s.id IS NULL

UNION ALL

SELECT
    'Orphaned watchlist records' as check_type,
    COUNT(*) as error_count
FROM watchlist w
LEFT JOIN products p ON w.product_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT
    'Orphaned price alerts records' as check_type,
    COUNT(*) as error_count
FROM price_alerts pa
LEFT JOIN watchlist w ON pa.watchlist_id = w.id
LEFT JOIN stores s ON pa.store_id = s.id
WHERE w.id IS NULL OR s.id IS NULL;

-- ============================================================================
-- SAMPLE APPLICATION QUERIES
-- ============================================================================

-- Query: Get trending sneakers (most price checks in last 7 days)
SELECT
    p.brand,
    p.model,
    p.colorway,
    p.image_url,
    COUNT(ph.id) as price_checks,
    MIN(COALESCE(ph.sale_price, ph.price)) as lowest_price,
    MAX(COALESCE(ph.sale_price, ph.price)) as highest_price,
    AVG(COALESCE(ph.sale_price, ph.price)) as avg_price
FROM products p
JOIN price_history ph ON p.id = ph.product_id
WHERE ph.checked_at >= (NOW() - INTERVAL '7 days')
    AND ph.in_stock = true
GROUP BY p.id, p.brand, p.model, p.colorway, p.image_url
HAVING COUNT(ph.id) > 2
ORDER BY price_checks DESC, lowest_price ASC
LIMIT 10;

-- Query: Get best deals (biggest discount from retail)
SELECT
    p.sku,
    p.brand,
    p.model,
    p.retail_price,
    clp.current_price,
    ((p.retail_price - clp.current_price) / p.retail_price * 100) as discount_percent,
    clp.store_name,
    clp.size
FROM products p
JOIN current_lowest_prices clp ON p.id = clp.product_id
WHERE clp.current_price < p.retail_price
    AND clp.in_stock = true
ORDER BY discount_percent DESC
LIMIT 10;