# SoleTracker Database Migration Guide

## 🎯 Quick Setup Options

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `ayfabzqcjedgvhhityxc`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run Each Migration File**

   **Step 1: Create Core Tables**
   - Copy contents of `supabase/migrations/001_create_core_tables.sql`
   - Paste into SQL Editor
   - Click "Run" button
   - ✅ Should see: "Success. No rows returned"

   **Step 2: Setup RLS Policies**
   - Copy contents of `supabase/migrations/002_setup_rls_policies.sql`
   - Paste into SQL Editor
   - Click "Run"
   - ✅ Should see: "Success. No rows returned"

   **Step 3: Insert Store Data**
   - Copy contents of `supabase/migrations/003_insert_initial_stores.sql`
   - Paste into SQL Editor
   - Click "Run"
   - ✅ Should see: "Success. X rows returned" (sample data inserted)

   **Step 4: Add Test Data**
   - Copy contents of `supabase/migrations/004_test_data_and_queries.sql`
   - Paste into SQL Editor
   - Click "Run"
   - ✅ Should see: Sample data and test results

### Option 2: Using Node.js Script

1. **Install dependencies**:
   ```bash
   npm install dotenv
   ```

2. **Run the setup script**:
   ```bash
   node scripts/setup-database.js
   ```

### Option 3: Supabase CLI (If Available)

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   # or
   brew install supabase/tap/supabase
   ```

2. **Login and link project**:
   ```bash
   supabase login
   supabase link --project-ref ayfabzqcjedgvhhityxc
   ```

3. **Apply migrations**:
   ```bash
   supabase db push
   ```

## ✅ Verification Steps

### 1. Check Tables Created
Run this query in SQL Editor:
```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'users_extended', 'stores', 'watchlist', 'price_history', 'price_alerts')
ORDER BY table_name;
```

**Expected Result**: 6 tables listed

### 2. Verify Store Data
```sql
SELECT name, domain, active FROM stores ORDER BY name;
```

**Expected Result**: 5 stores (Nike, Snipes USA, Shoe Palace, Foot Locker, Hibbett Sports)

### 3. Check Sample Products
```sql
SELECT sku, brand, model, colorway FROM products ORDER BY brand, model;
```

**Expected Result**: 5 sample sneakers

### 4. Test Price History
```sql
SELECT COUNT(*) as total_price_records FROM price_history;
```

**Expected Result**: Multiple price history records

### 5. Test Views
```sql
SELECT * FROM current_lowest_prices LIMIT 3;
```

**Expected Result**: Products with current lowest prices

### 6. Test Functions
```sql
SELECT * FROM get_lowest_price(
    (SELECT id FROM products WHERE sku = 'DD1391-100'),
    '9.5'
);
```

**Expected Result**: Lowest price data for Dunk Low size 9.5

## 🚨 Troubleshooting

### Issue: "permission denied for schema public"
**Solution**: Make sure you're using the correct project and have owner/admin access.

### Issue: "relation already exists"
**Solution**: Tables might already exist. Check existing schema or drop tables first.

### Issue: "function exec does not exist"
**Solution**: Use Supabase dashboard method instead of Node.js script.

### Issue: UUID extension errors
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 🎯 Success Checklist

After running all migrations, verify:

- [ ] **6 tables created**: products, users_extended, stores, watchlist, price_history, price_alerts
- [ ] **5 stores inserted**: Nike, Snipes USA, Shoe Palace, Foot Locker, Hibbett Sports
- [ ] **Sample products added**: Jordan 1, Dunk Low, Air Force 1, New Balance 550, Samba OG
- [ ] **Price history populated**: Multiple price records across different stores
- [ ] **Views working**: current_lowest_prices, user_watchlist_with_prices
- [ ] **Functions working**: get_lowest_price(), get_price_trend()
- [ ] **RLS policies active**: Row Level Security enabled on all tables

## 🚀 Next Steps

1. **Generate TypeScript Types**:
   ```bash
   npx supabase gen types typescript --project-id ayfabzqcjedgvhhityxc > types/database.types.ts
   ```

2. **Test Database Connection**:
   ```typescript
   import { createClient } from '@/utils/supabase/client'

   const supabase = createClient()
   const { data } = await supabase.from('stores').select('name')
   console.log('Stores:', data)
   ```

3. **Start Building Features**:
   - User authentication and profiles
   - Product search and browsing
   - Watchlist management
   - Price tracking and alerts
   - Dashboard and analytics

## 📊 Database Schema Overview

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│   products  │    │   price_history  │    │   stores    │
│─────────────│    │──────────────────│    │─────────────│
│ id (PK)     │◄──┤ product_id (FK)  │   ┌┤ id (PK)     │
│ sku (UNIQUE)│    │ store_id (FK)    │───┘ │ name        │
│ brand       │    │ size             │     │ domain      │
│ model       │    │ price            │     │ rules       │
│ colorway    │    │ sale_price       │     └─────────────┘
│ retail_price│    │ in_stock         │
└─────────────┘    │ checked_at       │
                   └──────────────────┘

┌─────────────────┐    ┌──────────────┐    ┌──────────────┐
│ users_extended  │    │  watchlist   │    │ price_alerts │
│─────────────────│    │──────────────│    │──────────────│
│ id (FK→auth)    │◄──┤ user_id (FK) │   ┌┤ watchlist_id │
│ display_name    │    │ product_id   │───┘ │ triggered_at │
│ notification_*  │    │ ideal_size   │     │ price        │
└─────────────────┘    │ target_price │     │ store_id (FK)│
                       │ tried_on     │     │ notified     │
                       └──────────────┘     └──────────────┘
```

Your SoleTracker database is ready! 🚀