// SoleTracker Database Setup (Node.js version)
// Simple script to apply migrations to Supabase

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const migrations = [
  '001_create_core_tables.sql',
  '002_setup_rls_policies.sql',
  '003_insert_initial_stores.sql',
  '004_test_data_and_queries.sql'
]

async function executeSql(sql) {
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec', { query: statement })
        if (error) {
          console.error('SQL Error:', error.message)
          console.error('Statement:', statement.substring(0, 100) + '...')
          return false
        }
      }
    }
    return true
  } catch (error) {
    console.error('Execution error:', error.message)
    return false
  }
}

async function runMigration(fileName) {
  try {
    console.log(`\n🔄 Running migration: ${fileName}`)

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', fileName)

    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ Migration file not found: ${sqlPath}`)
      return false
    }

    const sql = fs.readFileSync(sqlPath, 'utf8')
    const success = await executeSql(sql)

    if (success) {
      console.log(`✅ Migration ${fileName} completed`)
    } else {
      console.log(`❌ Migration ${fileName} failed`)
    }

    return success
  } catch (error) {
    console.error(`❌ Error in migration ${fileName}:`, error.message)
    return false
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying database setup...')

  const tables = ['products', 'stores', 'users_extended', 'watchlist', 'price_history', 'price_alerts']

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: OK`)
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }

  // Test stores data
  const { data: stores } = await supabase.from('stores').select('name').limit(5)
  console.log(`\n📊 Found ${stores?.length || 0} stores`)

  // Test products data
  const { data: products } = await supabase.from('products').select('brand, model').limit(5)
  console.log(`📊 Found ${products?.length || 0} products`)
}

async function main() {
  console.log('🚀 SoleTracker Database Setup')
  console.log(`📍 Target: ${supabaseUrl}`)
  console.log('=' .repeat(50))

  // Note: Direct SQL execution might not work with anon key
  // This script provides the structure, but you may need to run SQL manually

  console.log('\n⚠️  IMPORTANT NOTE:')
  console.log('This script may not be able to execute DDL statements with the anon key.')
  console.log('If you encounter permission errors, please:')
  console.log('1. Copy the SQL from each migration file')
  console.log('2. Paste and run it in your Supabase dashboard > SQL Editor')
  console.log('3. Run migrations in order: 001, 002, 003, 004')

  let allSuccessful = true

  for (const migration of migrations) {
    const success = await runMigration(migration)
    if (!success) {
      allSuccessful = false
      // Continue with other migrations
    }
    // Wait a bit between migrations
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  await verifySetup()

  if (allSuccessful) {
    console.log('\n🎉 Database setup completed!')
  } else {
    console.log('\n⚠️  Some migrations had issues. Check the output above.')
    console.log('You may need to run the SQL files manually in Supabase dashboard.')
  }
}

main().catch(console.error)