/**
 * supabase/functions/check-prices/index.ts
 *
 * Weekly price checking edge function
 * Runs every Sunday at 2 AM via cron job
 *
 * Architecture:
 * - Tier 1: Simple fetch with rotating user agents (70-80% success)
 * - Tier 2: Browserless with JS rendering (15-20% more)
 * - Tier 3: Circuit breaker & monitoring
 * - Retry logic: 3 attempts with exponential backoff (2s, 4s, 8s)
 * - Rate limiting: 2 second delay between requests
 * - Auto-disable: After 3 consecutive failures
 * - Price validation: Rejects $0, extreme values, >200% markup
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

// ============================================================================
// RETAILER CONFIGURATIONS (inline for Deno compatibility)
// ============================================================================

interface RetailerConfig {
  domain: string
  name: string
  selectors: {
    price: string[]
    salePrice?: string[]
  }
  requiresJS: boolean
  userAgent?: string
}

const RETAILER_CONFIGS: RetailerConfig[] = [
  {
    domain: 'nike.com',
    name: 'Nike',
    selectors: {
      price: ['[data-test="product-price"]', '.product-price__wrapper', '[class*="product-price"]', 'meta[property="product:price:amount"]', 'meta[property="og:price:amount"]']
    },
    requiresJS: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    domain: 'adidas.com',
    name: 'Adidas',
    selectors: {
      price: ['[data-auto-id="product-price"]', '.gl-price', 'meta[property="og:price:amount"]']
    },
    requiresJS: true
  },
  {
    domain: 'footlocker.com',
    name: 'Foot Locker',
    selectors: {
      price: ['[data-test="product-price"]', '.ProductPrice', '[itemprop="price"]']
    },
    requiresJS: false
  },
  {
    domain: 'myshopify.com',
    name: 'Shopify',
    selectors: {
      price: ['[data-product-price]', '.price', 'meta[property="og:price:amount"]']
    },
    requiresJS: false
  },
  {
    domain: 'finishline.com',
    name: 'Finish Line',
    selectors: {
      price: ['[data-test="product-price"]', '.ProductPrice-price', '[itemprop="price"]']
    },
    requiresJS: false
  },
  {
    domain: 'champssports.com',
    name: 'Champs',
    selectors: {
      price: ['[data-test="product-price"]', '.ProductPrice', '[class*="price"]']
    },
    requiresJS: false
  },
  {
    domain: 'jdsports.com',
    name: 'JD Sports',
    selectors: {
      price: ['[data-e2e="product-price"]', '.price', '[itemprop="price"]']
    },
    requiresJS: true
  },
  {
    domain: 'eastbay.com',
    name: 'Eastbay',
    selectors: {
      price: ['[data-test="product-price"]', '.ProductPrice']
    },
    requiresJS: false
  },
  {
    domain: 'hibbett.com',
    name: 'Hibbett',
    selectors: {
      price: ['.product-price', '[data-price]', '[itemprop="price"]']
    },
    requiresJS: false
  },
  {
    domain: 'dickssportinggoods.com',
    name: "Dick's",
    selectors: {
      price: ['[data-testid="product-price"]', '.dsg-price']
    },
    requiresJS: true
  },
  {
    domain: 'oldnavy.gap.com',
    name: 'Old Navy',
    selectors: {
      price: ['[data-test="product-price"]', '.product-price', '[class*="ProductPrice"]', 'meta[property="og:price:amount"]']
    },
    requiresJS: true
  },
  {
    domain: 'shoepalace.com',
    name: 'Shoe Palace',
    selectors: {
      price: ['.product-price', '[data-product-price]', '[itemprop="price"]', 'meta[property="og:price:amount"]']
    },
    requiresJS: false
  },
  {
    domain: 'hollister.com',
    name: 'Hollister',
    selectors: {
      price: ['[data-test="product-price"]', '.product-price', 'meta[property="og:price:amount"]']
    },
    requiresJS: true
  },
  {
    domain: 'stance.com',
    name: 'Stance',
    selectors: {
      price: ['[data-product-price]', '.product-price', '.price', 'meta[property="og:price:amount"]']
    },
    requiresJS: false
  },
  {
    domain: 'bathandbodyworks.com',
    name: 'Bath & Body Works',
    selectors: {
      price: ['.product-price', '[data-price]', '[itemprop="price"]', 'meta[property="og:price:amount"]']
    },
    requiresJS: false
  },
  {
    domain: 'houseofheat.co',
    name: 'House of Heat',
    selectors: {
      price: ['.product-price', '[data-product-price]', 'meta[property="og:price:amount"]']
    },
    requiresJS: false
  }
]

function getRetailerConfig(url: string): RetailerConfig | null {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return RETAILER_CONFIGS.find(c => hostname.includes(c.domain)) || null
  } catch {
    return null
  }
}

// ============================================================================
// PRICE PARSING & VALIDATION
// ============================================================================

function parsePrice(priceString: string): number | null {
  if (!priceString) return null
  let cleaned = priceString.replace(/[^0-9.,]/g, '')
  if (cleaned.match(/,\d{2}$/)) cleaned = cleaned.replace(',', '.')
  cleaned = cleaned.replace(/,/g, '')
  const price = parseFloat(cleaned)
  return isNaN(price) || price === 0 ? null : price
}

function validatePrice(price: number, itemRetailPrice?: number): boolean {
  if (price <= 0) return false
  if (price > 50000) return false
  if (price < 1) return false
  if (itemRetailPrice && price > itemRetailPrice * 2) return false
  return true
}

// ============================================================================
// ERROR CATEGORIZATION
// ============================================================================

type ErrorCategory = 'network_error' | 'parse_error' | 'bot_detection' | 'timeout' | 'invalid_price' | 'unknown'

function categorizeError(error: string, statusCode?: number): ErrorCategory {
  if (statusCode === 403 || statusCode === 429) return 'bot_detection'
  if (statusCode && statusCode >= 500) return 'network_error'
  if (error.includes('timeout') || error.includes('timed out')) return 'timeout'
  if (error.includes('price not found') || error.includes('Could not find')) return 'parse_error'
  if (error.includes('validation failed') || error.includes('invalid price')) return 'invalid_price'
  if (error.includes('fetch') || error.includes('network')) return 'network_error'
  return 'unknown'
}

// ============================================================================
// USER AGENTS & CONFIG
// ============================================================================

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

const RATE_LIMIT_DELAY = 2000 // 2 seconds
const GENERIC_SELECTORS = ['[itemprop="price"]', 'meta[property="product:price:amount"]', 'meta[property="og:price:amount"]', '.price']

interface ScrapeResult {
  success: boolean
  price?: number
  error?: string
  errorCategory?: ErrorCategory
  method?: 'fetch' | 'browserless'
  statusCode?: number
}

// ============================================================================
// TIER 1: SIMPLE FETCH
// ============================================================================

async function scrapeWithFetch(url: string, config: RetailerConfig | null, retailPrice?: number): Promise<ScrapeResult> {
  try {
    const userAgent = config?.userAgent || USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]

    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      const category = categorizeError(`HTTP ${response.status}`, response.status)
      return { success: false, error: `HTTP ${response.status}`, errorCategory: category, statusCode: response.status }
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    if (!doc) {
      return { success: false, error: 'Failed to parse HTML', errorCategory: 'parse_error' }
    }

    // Try retailer-specific selectors
    if (config) {
      for (const selector of config.selectors.price) {
        const element = doc.querySelector(selector)
        if (element) {
          const priceText = element.tagName === 'META'
            ? element.getAttribute('content')
            : element.textContent?.trim()

          if (priceText) {
            const price = parsePrice(priceText)
            if (price && validatePrice(price, retailPrice)) {
              console.log(`✅ Fetch: Found valid price with "${selector}": $${price}`)
              return { success: true, price, method: 'fetch' }
            } else if (price && !validatePrice(price, retailPrice)) {
              console.log(`⚠️  Fetch: Invalid price $${price} (failed validation)`)
            }
          }
        }
      }
    }

    // Try generic selectors
    for (const selector of GENERIC_SELECTORS) {
      const element = doc.querySelector(selector)
      if (element) {
        const priceText = element.tagName === 'META'
          ? element.getAttribute('content')
          : element.textContent?.trim()

        if (priceText) {
          const price = parsePrice(priceText)
          if (price && validatePrice(price, retailPrice)) {
            console.log(`✅ Fetch: Found valid price with generic "${selector}": $${price}`)
            return { success: true, price, method: 'fetch' }
          }
        }
      }
    }

    return { success: false, error: 'Price not found in HTML', errorCategory: 'parse_error' }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const category = categorizeError(errorMsg)
    return { success: false, error: errorMsg, errorCategory: category }
  }
}

// ============================================================================
// TIER 2: BROWSERLESS (JS RENDERING)
// ============================================================================

async function scrapeWithBrowserless(url: string, config: RetailerConfig | null, retailPrice?: number): Promise<ScrapeResult> {
  const BROWSERLESS_API_KEY = Deno.env.get('BROWSERLESS_API_KEY')

  if (!BROWSERLESS_API_KEY) {
    return { success: false, error: 'Browserless not configured', errorCategory: 'unknown' }
  }

  try {
    console.log(`🌐 Browserless: Rendering JS for ${url}`)

    // Browserless content API - gets HTML after JS execution
    const apiUrl = `https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        waitFor: 2000, // Wait 2s for JS to execute
        gotoOptions: {
          waitUntil: 'networkidle2'
        }
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      const category = categorizeError(`Browserless HTTP ${response.status}`, response.status)
      return { success: false, error: `Browserless HTTP ${response.status}`, errorCategory: category, statusCode: response.status }
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    if (!doc) {
      return { success: false, error: 'Failed to parse Browserless response', errorCategory: 'parse_error' }
    }

    const selectors = config ? config.selectors.price : GENERIC_SELECTORS

    for (const selector of selectors) {
      const element = doc.querySelector(selector)
      if (element) {
        const priceText = element.tagName === 'META'
          ? element.getAttribute('content')
          : element.textContent?.trim()

        if (priceText) {
          const price = parsePrice(priceText)
          if (price && validatePrice(price, retailPrice)) {
            console.log(`✅ Browserless: Found valid price: $${price}`)
            return { success: true, price, method: 'browserless' }
          } else if (price && !validatePrice(price, retailPrice)) {
            console.log(`⚠️  Browserless: Invalid price $${price} (failed validation)`)
          }
        }
      }
    }

    return { success: false, error: 'Price not found via Browserless', errorCategory: 'parse_error' }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const category = categorizeError(errorMsg)
    return { success: false, error: errorMsg, errorCategory: category }
  }
}

// ============================================================================
// MAIN SCRAPING WITH RETRY LOGIC
// ============================================================================

async function scrapePrice(url: string, retailPrice?: number, maxRetries = 3): Promise<ScrapeResult> {
  const config = getRetailerConfig(url)

  if (config) {
    console.log(`📋 Config: ${config.name} (JS: ${config.requiresJS})`)
  } else {
    console.log(`⚠️  Unknown retailer, using generic selectors`)
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔄 Attempt ${attempt}/${maxRetries}`)

    // TIER 1: Try fetch first
    let result = await scrapeWithFetch(url, config, retailPrice)

    if (result.success) {
      console.log(`✅ Success on attempt ${attempt} via ${result.method}`)
      return result
    }

    console.log(`❌ Fetch failed: ${result.error} (${result.errorCategory})`)

    // TIER 2: If JS required OR fetch got bot detection, try Browserless
    if (config?.requiresJS || result.errorCategory === 'bot_detection') {
      console.log(`🔄 Trying Browserless (JS rendering)...`)
      result = await scrapeWithBrowserless(url, config, retailPrice)

      if (result.success) {
        console.log(`✅ Browserless success on attempt ${attempt}`)
        return result
      }

      console.log(`❌ Browserless failed: ${result.error} (${result.errorCategory})`)
    }

    // Retry with exponential backoff
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
      console.log(`⏳ Waiting ${delay}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return { success: false, error: 'All attempts exhausted', errorCategory: 'unknown' }
}

// ============================================================================
// MAIN EDGE FUNCTION HANDLER
// ============================================================================

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    })
  }

  try {
    console.log('\n🚀 Starting weekly price check...')
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('📋 Fetching items to check...')

    // Query items table (legacy "sneakers" table)
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('id, product_url, retail_price, brand, model, price_check_failures, user_id')
      .eq('status', 'wishlisted')
      .not('product_url', 'is', null)
      .eq('auto_price_tracking_enabled', true)
      .lt('price_check_failures', 3)
      .limit(60) // Keep under 150s timeout: 60 items × 2s = 120s

    if (fetchError) throw fetchError

    if (!items || items.length === 0) {
      console.log('✅ No items to check')
      return new Response(
        JSON.stringify({ success: true, message: 'No items', checked: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📦 Found ${items.length} items\n`)

    let successCount = 0
    let failureCount = 0
    const alerts: any[] = []
    const retailerStats: Record<string, { success: number; failure: number }> = {}

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📦 ${i + 1}/${items.length}: ${item.brand} ${item.model}`)
      console.log(`🔗 ${item.product_url}`)

      const result = await scrapePrice(item.product_url, item.retail_price)

      // Track per-retailer stats
      const config = getRetailerConfig(item.product_url)
      const retailerKey = config?.name || 'Unknown'
      if (!retailerStats[retailerKey]) {
        retailerStats[retailerKey] = { success: 0, failure: 0 }
      }

      if (result.success && result.price) {
        successCount++
        retailerStats[retailerKey].success++
        console.log(`✅ SUCCESS: $${result.price} via ${result.method}`)

        // Get previous price
        const { data: priceHistory } = await supabase
          .from('price_history')
          .select('price')
          .eq('item_id', item.id)
          .order('checked_at', { ascending: false })
          .limit(1)
          .single()

        const previousPrice = priceHistory?.price || item.retail_price

        // Insert price history
        await supabase.from('price_history').insert({
          item_id: item.id,
          user_id: item.user_id,
          price: result.price,
          checked_at: new Date().toISOString(),
          source: result.method === 'browserless' ? 'browserless_scrape' : 'automated_scrape'
        })

        // Check for price drop
        if (previousPrice && result.price < previousPrice) {
          const dropAmount = previousPrice - result.price
          const dropPercentage = (dropAmount / previousPrice) * 100

          let severity: 'low' | 'medium' | 'high' = 'low'
          if (dropPercentage >= 30) severity = 'high'
          else if (dropPercentage >= 15) severity = 'medium'

          console.log(`🎉 DROP: $${previousPrice} → $${result.price} (-${dropPercentage.toFixed(1)}%)`)

          const { data: alert } = await supabase
            .from('price_alerts')
            .insert({
              item_id: item.id,
              user_id: item.user_id,
              previous_price: previousPrice,
              current_price: result.price,
              percentage_off: Math.round(dropPercentage),
              severity,
              message: `${item.brand} ${item.model} dropped to $${result.price} (${Math.round(dropPercentage)}% off)`,
              is_read: false,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (alert) alerts.push(alert)
        }

        // Reset failure count and update last check
        await supabase
          .from('items')
          .update({
            price_check_failures: 0,
            last_price_check_at: new Date().toISOString(),
            sale_price: result.price,
            lowest_price_seen: result.price < (previousPrice || Infinity) ? result.price : previousPrice
          })
          .eq('id', item.id)

      } else {
        failureCount++
        retailerStats[retailerKey].failure++
        console.log(`❌ FAILURE: ${result.error} (${result.errorCategory})`)

        const newFailureCount = (item.price_check_failures || 0) + 1

        await supabase
          .from('items')
          .update({
            price_check_failures: newFailureCount,
            last_price_check_at: new Date().toISOString(),
            auto_price_tracking_enabled: newFailureCount < 3
          })
          .eq('id', item.id)

        if (newFailureCount >= 3) {
          console.log(`🔴 DISABLED after 3 failures`)
        }
      }

      // Rate limiting
      if (i < items.length - 1) {
        console.log(`⏳ Rate limit: ${RATE_LIMIT_DELAY}ms`)
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
      }
    }

    // Log per-retailer stats
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📊 OVERALL RESULTS`)
    console.log(`✅ Success: ${successCount}/${items.length} (${(successCount/items.length*100).toFixed(1)}%)`)
    console.log(`❌ Failures: ${failureCount}/${items.length}`)
    console.log(`🔔 Alerts: ${alerts.length}`)
    console.log(`\n📈 PER-RETAILER STATS:`)

    Object.entries(retailerStats).forEach(([name, stats]) => {
      const total = stats.success + stats.failure
      const rate = total > 0 ? (stats.success / total * 100).toFixed(1) : '0.0'
      console.log(`  ${name}: ${stats.success}/${total} (${rate}%)`)
    })

    return new Response(
      JSON.stringify({
        success: true,
        checked: items.length,
        successCount,
        failureCount,
        successRate: `${(successCount/items.length*100).toFixed(1)}%`,
        alertsCreated: alerts.length,
        retailerStats,
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ CRITICAL:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
