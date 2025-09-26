// SoleTracker Migration Script
// Automatically apply all migrations to Supabase database

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY! // You'll need to add this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('- SUPABASE_SERVICE_KEY:', !!supabaseServiceKey)
  console.error('\nPlease add SUPABASE_SERVICE_KEY to your .env.local file')
  process.exit(1)
}

// Create Supabase client with service key (has admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const migrations = [
  '001_create_core_tables.sql',
  '002_setup_rls_policies.sql',
  '003_insert_initial_stores.sql',
  '004_test_data_and_queries.sql'
]

async function runMigration(fileName: string): Promise<boolean> {
  try {
    console.log(`\n🔄 Running migration: ${fileName}`)

    // Read the SQL file
    const sqlPath = join(process.cwd(), 'supabase', 'migrations', fileName)
    const sql = readFileSync(sqlPath, 'utf8')

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error(`❌ Migration ${fileName} failed:`, error.message)
      return false
    }

    console.log(`✅ Migration ${fileName} completed successfully`)
    return true
  } catch (error) {
    console.error(`❌ Error running migration ${fileName}:`, error)
    return false
  }
}

async function verifyTables(): Promise<void> {
  console.log('\n🔍 Verifying tables were created...')

  const expectedTables = [
    'products',
    'users_extended',
    'stores',
    'watchlist',
    'price_history',
    'price_alerts'
  ]

  for (const table of expectedTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.error(`❌ Table ${table} not accessible:`, error.message)
    } else {
      console.log(`✅ Table ${table} exists and is accessible`)
    }
  }
}

async function testBasicQueries(): Promise<void> {
  console.log('\n🧪 Testing basic queries...')

  // Test stores
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('name, domain')
    .limit(3)

  if (storesError) {
    console.error('❌ Error querying stores:', storesError.message)
  } else {
    console.log(`✅ Found ${stores?.length || 0} stores`)
    stores?.forEach(store => console.log(`  - ${store.name} (${store.domain})`))
  }

  // Test products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('sku, brand, model')
    .limit(3)

  if (productsError) {
    console.error('❌ Error querying products:', productsError.message)
  } else {
    console.log(`✅ Found ${products?.length || 0} products`)
    products?.forEach(product => console.log(`  - ${product.brand} ${product.model} (${product.sku})`))
  }
}

async function main() {
  console.log('🚀 SoleTracker Database Migration Script')
  console.log(`📍 Target: ${supabaseUrl}`)
  console.log('=' .repeat(50))

  let allSuccessful = true

  // Run migrations in order
  for (const migration of migrations) {
    const success = await runMigration(migration)
    if (!success) {
      allSuccessful = false
      break
    }
  }

  if (!allSuccessful) {
    console.log('\n❌ Migration process failed. Please check the errors above.')
    process.exit(1)
  }

  // Verify setup
  await verifyTables()
  await testBasicQueries()

  console.log('\n🎉 All migrations completed successfully!')
  console.log('\n📋 Next steps:')
  console.log('1. Generate TypeScript types: npm run db:types')
  console.log('2. Test your application with the new schema')
  console.log('3. Start building your sneaker tracking features!')
}

// Run the migration
main().catch(console.error)