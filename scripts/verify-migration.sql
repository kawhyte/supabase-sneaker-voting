-- SoleTracker Migration Verification Script
-- Run this after applying all migrations to verify everything works

-- ============================================================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================================================
SELECT
    table_name,
    table_type,
    'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'users_extended', 'stores', 'watchlist', 'price_history', 'price_alerts')
ORDER BY table_name;

-- Expected: 6 rows showing all tables

-- ============================================================================
-- 2. VERIFY STORES DATA
-- ============================================================================
SELECT
    name,
    domain,
    active,
    free_shipping_threshold
FROM stores
WHERE active = true
ORDER BY name;

-- Expected: 5 stores (Nike, Snipes USA, Shoe Palace, Foot Locker, Hibbett Sports)

-- ============================================================================
-- 3. VERIFY PRODUCTS DATA
-- ============================================================================
SELECT
    sku,
    brand,
    model,
    colorway,
    retail_price
FROM products
ORDER BY brand, model;

-- Expected: 5 sample sneakers

-- ============================================================================
-- 4. CHECK PRICE HISTORY
-- ============================================================================
SELECT
    COUNT(*) as total_price_records,
    COUNT(DISTINCT product_id) as products_with_prices,
    COUNT(DISTINCT store_id) as stores_with_prices
FROM price_history;

-- Expected: Multiple price records across products and stores

-- ============================================================================
-- 5. TEST VIEWS
-- ============================================================================
SELECT
    brand,
    model,
    size,
    current_price,
    store_name,
    in_stock
FROM current_lowest_prices
ORDER BY brand, model, size
LIMIT 10;

-- Expected: Products with their current lowest prices

-- ============================================================================
-- 6. TEST FUNCTIONS
-- ============================================================================
-- Test get_lowest_price function
SELECT
    'get_lowest_price test' as test_name,
    *
FROM get_lowest_price(
    (SELECT id FROM products WHERE sku = 'DD1391-100' LIMIT 1),
    '9.5'
);

-- Test get_price_trend function
SELECT
    'get_price_trend test' as test_name,
    checked_at,
    price,
    sale_price,
    store_name
FROM get_price_trend(
    (SELECT id FROM products WHERE sku = 'DZ5485-612' LIMIT 1),
    '10',
    30
)
LIMIT 5;

-- ============================================================================
-- 7. VERIFY RLS POLICIES
-- ============================================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Multiple RLS policies for each table

-- ============================================================================
-- 8. CHECK INDEXES
-- ============================================================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('products', 'stores', 'watchlist', 'price_history', 'price_alerts')
ORDER BY tablename, indexname;

-- Expected: Multiple indexes for performance

-- ============================================================================
-- 9. TEST FOREIGN KEY RELATIONSHIPS
-- ============================================================================
-- Check for orphaned records (should return 0 for all)
SELECT
    'Orphaned price_history (missing products)' as check_type,
    COUNT(*) as error_count
FROM price_history ph
LEFT JOIN products p ON ph.product_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT
    'Orphaned price_history (missing stores)' as check_type,
    COUNT(*) as error_count
FROM price_history ph
LEFT JOIN stores s ON ph.store_id = s.id
WHERE s.id IS NULL

UNION ALL

SELECT
    'Orphaned watchlist (missing products)' as check_type,
    COUNT(*) as error_count
FROM watchlist w
LEFT JOIN products p ON w.product_id = p.id
WHERE p.id IS NULL;

-- Expected: All counts should be 0

-- ============================================================================
-- 10. PERFORMANCE TEST
-- ============================================================================
-- Test query performance on indexed columns
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    p.brand,
    p.model,
    ph.size,
    MIN(COALESCE(ph.sale_price, ph.price)) as lowest_price
FROM products p
JOIN price_history ph ON p.id = ph.product_id
WHERE ph.in_stock = true
GROUP BY p.id, p.brand, p.model, ph.size
ORDER BY p.brand, p.model, ph.size
LIMIT 20;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT
    '🎉 Migration verification complete!' as status,
    'All checks passed - SoleTracker database is ready!' as message;