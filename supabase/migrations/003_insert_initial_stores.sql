-- SoleTracker Initial Store Data
-- Migration: Insert initial store data for the 5 main retailers

-- ============================================================================
-- INSERT INITIAL STORE DATA
-- ============================================================================

INSERT INTO stores (name, domain, free_shipping_threshold, selector_rules, active) VALUES

-- Nike.com
(
    'Nike',
    'nike.com',
    75.00,
    '{
        "price_selector": ".product-price",
        "sale_price_selector": ".product-price--sale",
        "availability_selector": ".add-to-cart-btn",
        "size_selector": ".size-selector option",
        "image_selector": ".hero-image img",
        "product_name_selector": ".product-title h1"
    }'::jsonb,
    true
),

-- Snipes USA
(
    'Snipes USA',
    'snipesusa.com',
    50.00,
    '{
        "price_selector": ".price-current",
        "sale_price_selector": ".price-sale",
        "availability_selector": ".btn-add-cart",
        "size_selector": ".size-variant-selector option",
        "image_selector": ".product-main-image img",
        "product_name_selector": ".product-name h1"
    }'::jsonb,
    true
),

-- Shoe Palace
(
    'Shoe Palace',
    'shoepalace.com',
    89.00,
    '{
        "price_selector": ".regular-price",
        "sale_price_selector": ".special-price",
        "availability_selector": ".add-to-cart-button",
        "size_selector": ".size-options select option",
        "image_selector": ".product-image-main img",
        "product_name_selector": ".page-title h1"
    }'::jsonb,
    true
),

-- Foot Locker
(
    'Foot Locker',
    'footlocker.com',
    50.00,
    '{
        "price_selector": ".ProductPrice-label",
        "sale_price_selector": ".ProductPrice-original",
        "availability_selector": ".AddToBag",
        "size_selector": ".SizeSelector option",
        "image_selector": ".ProductImages img",
        "product_name_selector": ".ProductName"
    }'::jsonb,
    true
),

-- Hibbett Sports
(
    'Hibbett Sports',
    'hibbet.com',
    50.00,
    '{
        "price_selector": ".price-standard",
        "sale_price_selector": ".price-sale",
        "availability_selector": ".add-to-cart",
        "size_selector": ".size-selector option",
        "image_selector": ".product-primary-image img",
        "product_name_selector": ".product-title"
    }'::jsonb,
    true
);

-- ============================================================================
-- INSERT SAMPLE PRODUCTS FOR TESTING
-- ============================================================================

INSERT INTO products (sku, brand, model, colorway, category, retail_price, image_url) VALUES

-- Air Jordan 1 Retro High OG
(
    'DZ5485-612',
    'Nike',
    'Air Jordan 1 Retro High OG',
    'Chicago Lost and Found',
    'sneakers',
    180.00,
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/61734ab7-dad8-40de-afa4-db5b24dfa74d/air-jordan-1-retro-high-og-shoes-Pph9wD.png'
),

-- Dunk Low
(
    'DD1391-100',
    'Nike',
    'Dunk Low',
    'White/Black Panda',
    'sneakers',
    110.00,
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b1bcbca4-0193-4bdf-9e2c-6b068ba5ff5a/dunk-low-shoes-5FQWGR.png'
),

-- Air Force 1
(
    'CW2288-111',
    'Nike',
    'Air Force 1 07',
    'Triple White',
    'sneakers',
    90.00,
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/4f37fca8-6bce-43e7-ad07-f57ae3c13142/air-force-1-07-shoes-WrLlWX.png'
),

-- New Balance 550
(
    'BB550LWT',
    'New Balance',
    '550',
    'White/Grey',
    'sneakers',
    120.00,
    'https://nb.scene7.com/is/image/NB/bb550lwt_nb_02_i?$pdpflexf2$&qlt=80&fmt=webp&wid=440&hei=440'
),

-- Adidas Samba OG
(
    'B75806',
    'Adidas',
    'Samba OG',
    'Core Black/White',
    'sneakers',
    90.00,
    'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8e3eea1eb35441de89dba873015beecc_9366/Samba_OG_Shoes_Black_B75806_01_standard.jpg'
);

-- ============================================================================
-- CREATE VIEW FOR CURRENT LOWEST PRICES
-- ============================================================================

CREATE OR REPLACE VIEW current_lowest_prices AS
SELECT DISTINCT ON (ph.product_id, ph.size)
    p.id as product_id,
    p.sku,
    p.brand,
    p.model,
    p.colorway,
    ph.size,
    COALESCE(ph.sale_price, ph.price) as current_price,
    ph.sale_price,
    ph.price as regular_price,
    s.name as store_name,
    s.id as store_id,
    ph.url,
    ph.in_stock,
    ph.checked_at
FROM products p
JOIN price_history ph ON p.id = ph.product_id
JOIN stores s ON ph.store_id = s.id
WHERE ph.in_stock = true
    AND ph.checked_at >= (NOW() - INTERVAL '7 days')
ORDER BY ph.product_id, ph.size, COALESCE(ph.sale_price, ph.price) ASC;

-- ============================================================================
-- CREATE VIEW FOR USER WATCHLIST WITH CURRENT PRICES
-- ============================================================================

CREATE OR REPLACE VIEW user_watchlist_with_prices AS
SELECT
    w.id as watchlist_id,
    w.user_id,
    w.ideal_size,
    w.target_price,
    w.tried_on,
    w.owner_name,
    w.notes,
    w.created_at,
    p.id as product_id,
    p.sku,
    p.brand,
    p.model,
    p.colorway,
    p.image_url,
    p.retail_price,
    clp.current_price,
    clp.store_name,
    clp.store_id,
    clp.url as product_url,
    clp.in_stock,
    (w.target_price IS NOT NULL AND clp.current_price <= w.target_price) as target_met
FROM watchlist w
JOIN products p ON w.product_id = p.id
LEFT JOIN current_lowest_prices clp ON p.id = clp.product_id AND w.ideal_size = clp.size;

-- ============================================================================
-- CREATE INDEXES FOR VIEWS
-- ============================================================================

-- Indexes to support the views efficiently
CREATE INDEX IF NOT EXISTS idx_price_history_recent ON price_history(checked_at DESC, in_stock);
CREATE INDEX IF NOT EXISTS idx_price_history_product_size_price ON price_history(product_id, size, price);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_product ON watchlist(user_id, product_id);