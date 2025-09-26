# SoleTracker Supabase Database Setup Instructions

## Overview
This document provides step-by-step instructions for setting up the complete SoleTracker database schema in your Supabase project.

## Prerequisites
- Supabase account and project created
- Supabase CLI installed (optional but recommended)
- Access to Supabase dashboard

## Database Schema Overview

The SoleTracker database consists of 6 main tables:
- **products**: Sneaker product catalog
- **users_extended**: Extended user profiles
- **stores**: Retailer information and scraping rules
- **watchlist**: User's tracked products
- **price_history**: Historical price data across stores
- **price_alerts**: Price drop notifications

## Setup Methods

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Execute migrations in order**:

   **Step 1**: Run `001_create_core_tables.sql`
   ```sql
   -- Copy and paste the content from 001_create_core_tables.sql
   ```

   **Step 2**: Run `002_setup_rls_policies.sql`
   ```sql
   -- Copy and paste the content from 002_setup_rls_policies.sql
   ```

   **Step 3**: Run `003_insert_initial_stores.sql`
   ```sql
   -- Copy and paste the content from 003_insert_initial_stores.sql
   ```

   **Step 4**: Run `004_test_data_and_queries.sql`
   ```sql
   -- Copy and paste the content from 004_test_data_and_queries.sql
   ```

### Method 2: Using Supabase CLI

1. **Initialize Supabase locally** (if not already done):
   ```bash
   supabase init
   ```

2. **Link to your remote project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

3. **Apply migrations**:
   ```bash
   supabase db push
   ```

## Verification Steps

### 1. Check Tables Created
Run this query in SQL Editor to verify all tables exist:
```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'users_extended', 'stores', 'watchlist', 'price_history', 'price_alerts')
ORDER BY table_name;
```

### 2. Verify Sample Data
Check that stores and products were inserted:
```sql
-- Check stores
SELECT name, domain, active FROM stores ORDER BY name;

-- Check products
SELECT sku, brand, model, colorway FROM products ORDER BY brand, model;

-- Check price history
SELECT COUNT(*) as price_records FROM price_history;
```

### 3. Test Views and Functions
```sql
-- Test current lowest prices view
SELECT * FROM current_lowest_prices LIMIT 5;

-- Test get_lowest_price function
SELECT * FROM get_lowest_price(
    (SELECT id FROM products WHERE sku = 'DD1391-100'),
    '9.5'
);
```

### 4. Verify RLS Policies
Check that RLS is enabled:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

## Post-Setup Configuration

### 1. Generate TypeScript Types
After setting up the database, generate TypeScript types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/database.types.ts
```

### 2. Update Environment Variables
Ensure your `.env.local` has the correct Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 3. Test Database Connection
Create a simple test in your application:
```typescript
import { createClient } from '@/utils/supabase/client';

const testConnection = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('stores').select('name').limit(1);
  console.log('Database test:', { data, error });
};
```

## Expected Results

After successful setup, you should have:

### ✅ Tables
- [x] 6 main tables with proper relationships
- [x] Foreign key constraints
- [x] Indexes for performance
- [x] Update triggers

### ✅ Security
- [x] RLS policies active on all tables
- [x] User data protection
- [x] Public data (products, stores) accessible

### ✅ Sample Data
- [x] 5 retailer stores configured
- [x] 5 sample sneaker products
- [x] Sample price history data
- [x] Functional views and functions

### ✅ TypeScript Integration
- [x] Complete type definitions
- [x] Helper types exported
- [x] Type-safe database queries

## Common Issues & Solutions

### Issue: "UUID extension not found"
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: "auth.users table not found"
**Solution**: Ensure you're running queries in a Supabase project with Auth enabled.

### Issue: RLS blocking queries
**Solution**: Make sure you're authenticated or the policies are correctly configured.

### Issue: Migration order errors
**Solution**: Run migrations in the exact order specified (001, 002, 003, 004).

## Testing Queries

Use these queries to test your setup:

```sql
-- 1. Get all products with current prices
SELECT p.*, clp.current_price, clp.store_name
FROM products p
LEFT JOIN current_lowest_prices clp ON p.id = clp.product_id
ORDER BY p.brand, p.model;

-- 2. Check price tracking functionality
SELECT * FROM get_price_trend(
    (SELECT id FROM products WHERE sku = 'DZ5485-612'),
    '10',
    7
);

-- 3. Verify store configuration
SELECT name, domain, jsonb_pretty(selector_rules)
FROM stores WHERE active = true;
```

## Next Steps

1. **Set up price scraping service** to populate price_history
2. **Implement authentication flow** for user profiles
3. **Create watchlist management** in your app
4. **Set up price alert system** using the check_price_alerts() function
5. **Add cron jobs** for regular price updates

## Support

If you encounter issues:
1. Check the Supabase dashboard logs
2. Verify your project permissions
3. Ensure all migrations ran successfully
4. Test with the provided sample queries

The database is now ready for your SoleTracker application! 🚀