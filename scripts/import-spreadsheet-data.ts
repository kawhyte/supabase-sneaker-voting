// Script to import Google Sheets sneaker data into Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Data extracted from Google Sheets screenshot
const spreadsheetData = [
  {
    brand: 'Nike',
    model: 'Vomero 5',
    owner: 'Kenny',
    idealSize: '9M',
    upc: '',
    triedOn: 'Yes',
    store: 'Nike Minnesota',
    cost: 160.00,
    idealCostImageVideoLink: '$120.00',
    note: ''
  },
  {
    brand: 'Nike',
    model: 'Metcon 9',
    owner: 'Rene',
    idealSize: '7.5W',
    upc: '',
    triedOn: 'Yes',
    store: 'Nike Chicago',
    cost: 150.00,
    idealCostImageVideoLink: '$90.00',
    note: 'June 9: Nike 25% off online sale, $112'
  },
  {
    brand: 'Adidas',
    model: 'SL 72',
    owner: 'Kenny',
    idealSize: '9M',
    upc: '',
    triedOn: 'Yes',
    store: 'Vegas Shoe Palace',
    cost: 100.00,
    idealCostImageVideoLink: '$60.00',
    note: ''
  },
  {
    brand: 'Nike',
    model: 'Jordan 2 Low',
    owner: 'Kenny',
    idealSize: '8.5M',
    upc: '',
    triedOn: 'Yes',
    store: 'Vegas Shoe Palace',
    cost: 150.00,
    idealCostImageVideoLink: '$70.00',
    note: ''
  },
  {
    brand: 'Nike',
    model: 'Metcon 9',
    owner: 'Kenny',
    idealSize: '9.5M',
    upc: '',
    triedOn: 'Yes',
    store: 'Nike Chicago',
    cost: 150.00,
    idealCostImageVideoLink: '$60.00',
    note: 'Test size 9 before purchase'
  },
  {
    brand: 'New Balance',
    model: 'New Balance 550',
    owner: 'Kenny',
    idealSize: '8.5M',
    upc: '',
    triedOn: 'Yes',
    store: 'Vegas Shoe Palace',
    cost: 150.00,
    idealCostImageVideoLink: '$60.00',
    note: ''
  },
  {
    brand: 'Nike',
    model: 'Nike Attack',
    owner: 'Kenny',
    idealSize: '9M',
    upc: '',
    triedOn: 'Yes',
    store: 'Nike Outlet Pike Place Long Beach',
    cost: 130.00,
    idealCostImageVideoLink: '$65.00',
    note: ''
  },
  {
    brand: 'Converse',
    model: 'One Star Pro OX',
    owner: 'Kenny',
    idealSize: '9M',
    upc: '',
    triedOn: 'Yes',
    store: 'Converse Pike Place Long Beach',
    cost: 75.00,
    idealCostImageVideoLink: '$40.00',
    note: ''
  },
  {
    brand: 'Converse',
    model: 'Star Player 76',
    owner: 'Kenny',
    idealSize: '8.5M',
    upc: '',
    triedOn: 'Yes',
    store: 'Converse Pike Place Long Beach',
    cost: 75.00,
    idealCostImageVideoLink: '$40.00',
    note: ''
  },
  {
    brand: 'Converse',
    model: 'Fast break pro',
    owner: 'Kenny',
    idealSize: '8.5M',
    upc: '',
    triedOn: 'Yes',
    store: 'Converse Pike Place Long Beach',
    cost: 90.00,
    idealCostImageVideoLink: '$50.00',
    note: 'Good'
  },
  {
    brand: 'Nike',
    model: 'AJ 2 Retro',
    owner: 'Kenny',
    idealSize: '8.5M',
    upc: '',
    triedOn: 'Yes',
    store: 'Nike San Clemente',
    cost: 120.00,
    idealCostImageVideoLink: '',
    note: 'Looks too chunky on feet'
  },
  {
    brand: 'Nike',
    model: 'Nike Cortez',
    owner: 'Kenny',
    idealSize: '9M',
    upc: '',
    triedOn: 'Yes',
    store: 'Nike San Clemente',
    cost: 120.00,
    idealCostImageVideoLink: '$60.00',
    note: 'Tried on 9.5 and had minor heel slip. Too box could be too small at size9M'
  },
  {
    brand: 'Clarks',
    model: 'Clarks/Vennela Wey',
    owner: 'Rene',
    idealSize: '7W',
    upc: '',
    triedOn: 'Yes',
    store: 'Clarks San Clemente',
    cost: 140.00,
    idealCostImageVideoLink: '',
    note: ''
  },
  {
    brand: 'Clarks',
    model: 'Stayso',
    owner: 'Rene',
    idealSize: '7W',
    upc: '',
    triedOn: 'Yes',
    store: 'Clarks San Clemente',
    cost: 150.00,
    idealCostImageVideoLink: '',
    note: ''
  },
  {
    brand: 'Clarks',
    model: 'Carleigh Ray',
    owner: 'Rene',
    idealSize: '6.5W',
    upc: '',
    triedOn: 'Yes',
    store: 'Clarks San Clemente',
    cost: 85.00,
    idealCostImageVideoLink: '',
    note: ''
  },
  {
    brand: 'Clarks',
    model: 'Lyrical Rhyme',
    owner: 'Rene',
    idealSize: '7W',
    upc: '',
    triedOn: 'Yes',
    store: 'Clarks San Clemente',
    cost: 0, // No cost visible
    idealCostImageVideoLink: '',
    note: ''
  },
  {
    brand: 'Nike',
    model: 'Nike Zoom TT',
    owner: 'Kenny',
    idealSize: '9M',
    upc: '',
    triedOn: 'Yes',
    store: 'Sparks Nike',
    cost: 130.00,
    idealCostImageVideoLink: '$50.00',
    note: ''
  },
  {
    brand: 'Nike',
    model: 'Air Trainer 1',
    owner: 'Kenny',
    idealSize: '9M',
    upc: '',
    triedOn: 'Yes',
    store: 'Sparks Nike',
    cost: 0, // No cost visible
    idealCostImageVideoLink: '',
    note: ''
  },
  {
    brand: 'Nike',
    model: 'Nike Air force 1 Wild',
    owner: 'Kenny',
    idealSize: '8.5M',
    upc: '',
    triedOn: 'Yes',
    store: 'Sparks Nike',
    cost: 145.00,
    idealCostImageVideoLink: '$60.00',
    note: 'This iss woman shoe.'
  }
]

// Convert spreadsheet data to database format
function convertToDbFormat(data: typeof spreadsheetData) {
  return data.map(item => {
    // Determine if it's a perfect fit (assuming ideal size means perfect fit)
    const sizeTried = item.idealSize.replace(/[MW]$/, '') // Remove M/W suffix
    const fitRating = 3 // Assuming ideal size = perfect fit

    // Parse cost as listed price
    const listedPrice = item.cost > 0 ? item.cost : null

    return {
      user_name: item.owner,
      brand: item.brand,
      model: item.model,
      colorway: 'Standard', // Not specified in spreadsheet
      interaction_type: 'tried', // All entries show "Yes" for tried on
      size_tried: sizeTried,
      fit_rating: fitRating,
      comfort_rating: null, // Not specified in spreadsheet
      store_name: item.store,
      try_on_date: new Date().toISOString().split('T')[0], // Use today's date
      notes: item.note || null,
      listed_price: listedPrice,
      would_recommend: null, // Not specified in spreadsheet
      interested_in_buying: true, // Assume true since they're tracking
      image_url: null,
      cloudinary_id: null
    }
  })
}

async function importData() {
  try {
    console.log('🚀 Starting bulk import of sneaker data...')

    const dbData = convertToDbFormat(spreadsheetData)

    console.log(`📝 Converting ${dbData.length} records...`)

    // Insert data in batches to avoid overwhelming the database
    const batchSize = 10
    let imported = 0

    for (let i = 0; i < dbData.length; i += batchSize) {
      const batch = dbData.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('sneakers')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error)
        continue
      }

      imported += batch.length
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records`)
    }

    console.log(`🎉 Import complete! Successfully imported ${imported}/${dbData.length} records`)

    // Show summary
    const { data: totalRecords, error: countError } = await supabase
      .from('sneakers')
      .select('*', { count: 'exact' })

    if (!countError) {
      console.log(`📊 Total records in database: ${totalRecords?.length || 0}`)
    }

  } catch (error) {
    console.error('💥 Import failed:', error)
  }
}

// Export for use in Node.js
if (require.main === module) {
  importData()
}

export { importData, convertToDbFormat, spreadsheetData }