import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceScrapeResult {
  price: number | null
  error?: string
}

/**
 * Scrape price from a product URL using predefined store selectors
 */
async function scrapePrice(url: string): Promise<PriceScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      return { price: null, error: `HTTP ${response.status}` }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract price using common selectors
    let price: number | null = null

    // Try common e-commerce price selectors
    const selectors = [
      '[data-test*="price"]',
      '.price',
      '[class*="price"]',
      '[data-price]',
      '.product-price',
      '.sale-price',
      '[class*="sale-price"]',
      '.current-price',
      '.product-cost',
    ]

    for (const selector of selectors) {
      const priceText = $(selector).first().text().trim()
      if (priceText) {
        const extracted = extractPrice(priceText)
        if (extracted) {
          price = extracted
          break
        }
      }
    }

    if (!price) {
      return { price: null, error: 'Could not find price on page' }
    }

    return { price }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { price: null, error: errorMessage }
  }
}

/**
 * Extract numeric price from text (handles $99.99, €99,99, etc.)
 */
function extractPrice(text: string): number | null {
  const priceMatch = text.match(/[\d,]+\.?\d{0,2}/)
  if (!priceMatch) return null

  const cleaned = priceMatch[0].replace(/,/g, '')
  const price = parseFloat(cleaned)

  return isNaN(price) ? null : price
}

/**
 * Detect if price drop occurred and return details
 */
function detectPriceDrop(
  currentPrice: number,
  previousPrice: number | null,
  item: any
): { severity: string; message: string; percentageOff: number } | null {
  if (!previousPrice || previousPrice <= 0) {
    return null // Can't compare without previous price
  }

  const drop = previousPrice - currentPrice
  if (drop <= 0) {
    return null // Price didn't drop
  }

  const percentageOff = Math.round((drop / previousPrice) * 100)

  let severity = 'low'
  if (percentageOff >= 30) {
    severity = 'high'
  } else if (percentageOff >= 15) {
    severity = 'medium'
  }

  return {
    severity,
    message: `📉 Price drop! ${item.brand} ${item.model} is now $${currentPrice.toFixed(2)} (was $${previousPrice.toFixed(2)}) - ${percentageOff}% off!`,
    percentageOff,
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting price check job...')

    // Get environment variables with fallback error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing environment variables')
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // 1. Get all active price monitors (wishlist items with tracking enabled)
    console.log('📋 Fetching active price monitors...')
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'wishlisted')
      .eq('auto_price_tracking_enabled', true)
      .not('product_url', 'is', null)

    if (fetchError) {
      console.error('❌ Error fetching items:', fetchError)
      throw fetchError
    }

    if (!items || items.length === 0) {
      console.log('✅ No items to check')
      return new Response(JSON.stringify({ message: 'No items to check', checked: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`📊 Found ${items.length} items to check`)

    let successCount = 0
    let failureCount = 0
    const priceAlerts: any[] = []

    // 2. Batch process price checks
    for (const item of items) {
      console.log(`🔍 Checking price for: ${item.brand} ${item.model}`)

      if (!item.product_url) {
        console.log(`⏭️  Skipping - no URL available`)
        continue
      }

      // Scrape current price
      const scrapeResult = await scrapePrice(item.product_url)

      if (!scrapeResult.price) {
        console.error(`❌ Failed to scrape: ${scrapeResult.error}`)
        failureCount++

        // Increment failure counter
        const newFailures = (item.price_check_failures || 0) + 1
        console.log(`⚠️  Failure count: ${newFailures}/3`)

        // Disable tracking after 3 failures
        if (newFailures >= 3) {
          console.log(`🔴 Disabling price tracking (3 failures)`)
          await supabase
            .from('items')
            .update({
              auto_price_tracking_enabled: false,
              price_check_failures: newFailures,
            })
            .eq('id', item.id)
        } else {
          await supabase
            .from('items')
            .update({ price_check_failures: newFailures })
            .eq('id', item.id)
        }
        continue
      }

      const currentPrice = scrapeResult.price
      console.log(`✅ Current price: $${currentPrice.toFixed(2)}`)

      // 3. Check for price drop
      const previousPrice = item.lowest_price_seen || item.retail_price
      const priceDrop = detectPriceDrop(currentPrice, previousPrice, item)

      if (priceDrop) {
        console.log(`🎉 Price drop detected: ${priceDrop.message}`)
        priceAlerts.push({
          item_id: item.id,
          user_id: item.user_id,
          ...priceDrop,
          current_price: currentPrice,
          previous_price: previousPrice,
        })
      }

      // 4. Update price history and item metadata
      console.log(`💾 Updating database...`)

      const { error: historyError } = await supabase.from('price_history').insert({
        item_id: item.id,
        user_id: item.user_id,
        price: currentPrice,
        checked_at: new Date().toISOString(),
        source: 'automated_scrape',
      })

      if (historyError) {
        console.error(`❌ Error saving price history:`, historyError)
        failureCount++
        continue
      }

      // Update item with new price data
      const newLowest = currentPrice < (previousPrice || Infinity) ? currentPrice : previousPrice

      const { error: updateError } = await supabase
        .from('items')
        .update({
          lowest_price_seen: newLowest,
          last_price_check_at: new Date().toISOString(),
          price_check_failures: 0, // Reset failure counter on success
          sale_price: currentPrice,
        })
        .eq('id', item.id)

      if (updateError) {
        console.error(`❌ Error updating item:`, updateError)
        failureCount++
        continue
      }

      successCount++
    }

    // 5. Store price alerts for notification system
    if (priceAlerts.length > 0) {
      console.log(`📧 Creating ${priceAlerts.length} price alert notifications...`)

      // Store alerts in a notifications table for the app to display
      // This will be picked up by Phase 7.3: Add notification system
      const { error: alertError } = await supabase.from('price_alerts').insert(
        priceAlerts.map((alert) => ({
          ...alert,
          created_at: new Date().toISOString(),
          is_read: false,
        }))
      )

      if (alertError) {
        console.warn(`⚠️  Error storing alerts:`, alertError)
      }
    }

    const result = {
      message: 'Price check complete',
      checked: successCount,
      failed: failureCount,
      alerts: priceAlerts.length,
      timestamp: new Date().toISOString(),
    }

    console.log(`✅ Job complete: ${successCount} success, ${failureCount} failures, ${priceAlerts.length} alerts`)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('💥 Critical error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return new Response(
      JSON.stringify({
        error: 'Price check failed',
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
