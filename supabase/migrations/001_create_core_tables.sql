-- SoleTracker Database Schema
-- Migration: Create core tables for sneaker price tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(200) NOT NULL,
    colorway VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'sneakers',
    retail_price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    cloudinary_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on SKU for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand_model ON products(brand, model);

-- ============================================================================
-- USERS_EXTENDED TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users_extended (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    notification_email BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STORES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(100) UNIQUE NOT NULL,
    free_shipping_threshold DECIMAL(10,2),
    selector_rules JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on domain for fast lookups
CREATE INDEX IF NOT EXISTS idx_stores_domain ON stores(domain);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(active);

-- ============================================================================
-- WATCHLIST TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ideal_size VARCHAR(20) NOT NULL,
    target_price DECIMAL(10,2),
    tried_on BOOLEAN DEFAULT false,
    owner_name VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique combination of user, product, and size
    UNIQUE(user_id, product_id, ideal_size)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_product_id ON watchlist(product_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_target_price ON watchlist(target_price);

-- ============================================================================
-- PRICE_HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    in_stock BOOLEAN DEFAULT true,
    url TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure we can track price changes over time
    UNIQUE(product_id, store_id, size, checked_at)
);

-- Create compound index for efficient price queries
CREATE INDEX IF NOT EXISTS idx_price_history_product_store_size ON price_history(product_id, store_id, size);
CREATE INDEX IF NOT EXISTS idx_price_history_checked_at ON price_history(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_in_stock ON price_history(in_stock);

-- ============================================================================
-- PRICE_ALERTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID NOT NULL REFERENCES watchlist(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    price DECIMAL(10,2) NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for alert management
CREATE INDEX IF NOT EXISTS idx_price_alerts_watchlist_id ON price_alerts(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_notified ON price_alerts(notified);
CREATE INDEX IF NOT EXISTS idx_price_alerts_triggered_at ON price_alerts(triggered_at DESC);

-- ============================================================================
-- UPDATE TRIGGERS FOR updated_at columns
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_extended_updated_at BEFORE UPDATE ON users_extended
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlist_updated_at BEFORE UPDATE ON watchlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();