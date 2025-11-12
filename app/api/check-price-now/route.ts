/**
 * Manual Price Check API Route
 *
 * Allows users to manually trigger a price check for a single wishlist item.
 * Returns updated price data and updates the database.
 *
 * Method: POST
 * Body: { itemId: string }
 *
 * Response:
 * - success: true/false
 * - price: number (current sale price)
 * - retailPrice: number (original retail price)
 * - storeName: string (retailer name)
 * - message: string (user-friendly message)
 * - errorCategory: string (for unsupported retailers)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import * as cheerio from 'cheerio'

// ============================================================================
// RETAILER CONFIGURATIONS (Free-tier supported retailers)
// ============================================================================

interface RetailerConfig {
  domain: string
  name: string
  selectors: {
    price: string[]
    salePrice?: string[]
    originalPrice?: string[]
  }
  supportLevel: 'high' | 'medium' | 'low' // Success rate indicator
}

const RETAILER_CONFIGS: RetailerConfig[] = [
  // HIGH SUCCESS RATE (85-95%)
  {
    domain: 'footlocker.com',
    name: 'Foot Locker',
    selectors: {
      price: ['[data-test="product-price"]', '.ProductPrice', '[itemprop="price"]', 'meta[property="og:price:amount"]'],
      originalPrice: ['.ProductPrice-original', '[data-test="original-price"]']
    },
    supportLevel: 'high'
  },
  {
    domain: 'shoepalace.com',
    name: 'Shoe Palace',
    selectors: {
      price: ['[data-product-price]', '.product-price', '.price', 'meta[property="og:price:amount"]'],
      originalPrice: ['.price-original', '.compare-at-price', '.price-was']
    },
    supportLevel: 'high'
  },
  {
    domain: 'hibbett.com',
    name: 'Hibbett',
    selectors: {
      price: ['.product-price', '[data-price]', '[itemprop="price"]', 'meta[property="og:price:amount"]'],
      originalPrice: ['.price-was', '.price-original']
    },
    supportLevel: 'high'
  },
  {
    domain: 'myshopify.com',
    name: 'Shopify Store',
    selectors: {
      price: ['[data-product-price]', '.price', 'meta[property="og:price:amount"]'],
      originalPrice: ['.price--compare', '.compare-at-price']
    },
    supportLevel: 'high'
  },
  {
    domain: 'finishline.com',
    name: 'Finish Line',
    selectors: {
      price: ['[data-test="product-price"]', '.ProductPrice-price', '[itemprop="price"]'],
      originalPrice: ['.ProductPrice-original']
    },
    supportLevel: 'high'
  },
  {
    domain: 'champssports.com',
    name: 'Champs Sports',
    selectors: {
      price: ['[data-test="product-price"]', '.ProductPrice', '[class*="price"]'],
    },
    supportLevel: 'high'
  },

  // MEDIUM SUCCESS RATE (40-70%)
  {
    domain: 'gap.com',
    name: 'Gap',
    selectors: {
      price: ['[data-test="product-price"]', '.product-price', 'meta[property="og:price:amount"]'],
      originalPrice: ['.price-original', '[data-test="original-price"]']
    },
    supportLevel: 'medium'
  },
  {
    domain: 'oldnavy.gap.com',
    name: 'Old Navy',
    selectors: {
      price: ['[data-test="product-price"]', '.product-price', 'meta[property="og:price:amount"]'],
      originalPrice: ['.price-original', '[data-test="original-price"]']
    },
    supportLevel: 'medium'
  },
  {
    domain: 'bananarepublic.gap.com',
    name: 'Banana Republic',
    selectors: {
      price: ['[data-test="product-price"]', '.product-price', 'meta[property="og:price:amount"]'],
    },
    supportLevel: 'medium'
  },

  // LOW SUCCESS RATE (5-20%) - Will try but warn users
  {
    domain: 'nike.com',
    name: 'Nike',
    selectors: {
      price: ['[data-test="product-price"]', '.product-price', 'meta[property="og:price:amount"]'],
    },
    supportLevel: 'low'
  },
  {
    domain: 'adidas.com',
    name: 'Adidas',
    selectors: {
      price: ['[data-test="product-price"]', '.product-price', 'meta[property="og:price:amount"]'],
    },
    supportLevel: 'low'
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

function validatePrice(price: number, retailPrice?: number): boolean {
  if (price <= 0) return false
  if (price > 50000) return false
  if (price < 1) return false
  if (retailPrice && price > retailPrice * 2) return false
  return true
}

// ============================================================================
// SCRAPING LOGIC
// ============================================================================

async function scrapePrice(url: string, config: RetailerConfig | null, retailPrice?: number): Promise<{
  success: boolean
  price?: number
  originalPrice?: number
  error?: string
  storeName: string
  supportLevel?: 'high' | 'medium' | 'low'
}> {
  const storeName = config?.name || new URL(url).hostname.replace('www.', '').split('.')[0]
  const supportLevel = config?.supportLevel || 'low'

  try {
    // User agent rotation
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}${response.status === 403 ? ' - Site blocked request (anti-bot protection)' : ''}`,
        storeName,
        supportLevel
      }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    let price: number | null = null
    let originalPrice: number | null = null

    // Try retailer-specific selectors
    if (config) {
      // Try price selectors
      for (const selector of config.selectors.price) {
        const element = $(selector).first()
        if (element.length > 0) {
          const priceText = element.is('meta')
            ? element.attr('content')
            : element.text().trim()

          if (priceText) {
            const parsedPrice = parsePrice(priceText)
            if (parsedPrice && validatePrice(parsedPrice, retailPrice)) {
              price = parsedPrice
              break
            }
          }
        }
      }

      // Try original price selectors
      if (config.selectors.originalPrice) {
        for (const selector of config.selectors.originalPrice) {
          const element = $(selector).first()
          if (element.length > 0) {
            const priceText = element.text().trim()
            if (priceText) {
              const parsedPrice = parsePrice(priceText)
              if (parsedPrice) {
                originalPrice = parsedPrice
                break
              }
            }
          }
        }
      }
    }

    // Generic fallback selectors if config didn't work
    if (!price) {
      const genericSelectors = [
        '[itemprop="price"]',
        'meta[property="product:price:amount"]',
        'meta[property="og:price:amount"]',
        '.price',
        '[class*="price"]'
      ]

      for (const selector of genericSelectors) {
        const element = $(selector).first()
        if (element.length > 0) {
          const priceText = element.is('meta')
            ? element.attr('content')
            : element.text().trim()

          if (priceText) {
            const parsedPrice = parsePrice(priceText)
            if (parsedPrice && validatePrice(parsedPrice, retailPrice)) {
              price = parsedPrice
              break
            }
          }
        }
      }
    }

    if (!price) {
      return {
        success: false,
        error: supportLevel === 'low'
          ? `${storeName} uses advanced anti-bot protection. Free price checking has limited success for this retailer. Try visiting the site directly.`
          : 'Could not find price on page. The site layout may have changed.',
        storeName,
        supportLevel
      }
    }

    return {
      success: true,
      price,
      originalPrice,
      storeName,
      supportLevel
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: errorMsg.includes('timeout')
        ? `Request timed out - ${storeName} is taking too long to respond`
        : `Failed to check price: ${errorMsg}`,
      storeName,
      supportLevel
    }
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch item from database
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('id, product_url, retail_price, sale_price, brand, model, user_id, auto_price_tracking_enabled')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      )
    }

    // Check if tracking is enabled
    if (!item.auto_price_tracking_enabled) {
      return NextResponse.json(
        { success: false, message: 'Price tracking is disabled for this item. Enable it in the edit form.' },
        { status: 400 }
      )
    }

    // Validate product URL
    if (!item.product_url) {
      return NextResponse.json(
        { success: false, message: 'No product URL found. Add one in the edit form to enable price checking.' },
        { status: 400 }
      )
    }

    // Get retailer config and check support level
    const config = getRetailerConfig(item.product_url)

    // Scrape price
    const result = await scrapePrice(item.product_url, config, item.retail_price)

    if (!result.success) {
      // Log failed check
      await supabase.from('price_check_log').insert({
        item_id: item.id,
        user_id: user.id,
        checked_at: new Date().toISOString(),
        source: 'manual_check',
        retailer: result.storeName,
        success: false,
        error_message: result.error,
        error_category: result.supportLevel === 'low' ? 'unsupported_retailer' : 'parse_error'
      })

      // Increment failure count
      const newFailureCount = await supabase
        .from('items')
        .select('price_check_failures')
        .eq('id', item.id)
        .single()
        .then(({ data }) => (data?.price_check_failures || 0) + 1)

      await supabase
        .from('items')
        .update({
          price_check_failures: newFailureCount,
          last_price_check_at: new Date().toISOString(),
          auto_price_tracking_enabled: newFailureCount < 3 // Disable after 3 failures
        })
        .eq('id', item.id)

      return NextResponse.json({
        success: false,
        message: result.error,
        storeName: result.storeName,
        supportLevel: result.supportLevel,
        failureCount: newFailureCount
      })
    }

    // SUCCESS - Update database
    const updateData: any = {
      sale_price: result.price,
      last_price_check_at: new Date().toISOString(),
      price_check_failures: 0 // Reset on success
    }

    // Update lowest price if this is lower
    if (!item.sale_price || result.price < item.sale_price) {
      updateData.lowest_price_seen = result.price
    }

    await supabase
      .from('items')
      .update(updateData)
      .eq('id', item.id)

    // Log successful check
    await supabase.from('price_check_log').insert({
      item_id: item.id,
      user_id: user.id,
      price: result.price,
      checked_at: new Date().toISOString(),
      source: 'manual_check',
      retailer: result.storeName,
      success: true
    })

    // Check if price dropped and create notification
    const previousPrice = item.sale_price || item.retail_price
    if (previousPrice && result.price < previousPrice) {
      const dropPercentage = ((previousPrice - result.price) / previousPrice) * 100
      let severity: 'low' | 'medium' | 'high' = 'low'
      if (dropPercentage >= 30) severity = 'high'
      else if (dropPercentage >= 15) severity = 'medium'

      const notificationTitle =
        severity === 'high' ? 'Big Price Drop! 🎉' :
        severity === 'medium' ? 'Price Drop Alert 💰' :
        'Small Price Drop 👀'

      await supabase.from('notifications').insert({
        user_id: user.id,
        notification_type: 'price_alert',
        title: notificationTitle,
        message: `${item.brand} ${item.model} dropped to $${result.price} (${Math.round(dropPercentage)}% off)`,
        severity,
        link_url: `/dashboard?tab=wishlist&item=${item.id}`,
        action_label: 'View Item',
        is_read: false,
        metadata: {
          item_id: item.id,
          current_price: result.price,
          previous_price: previousPrice,
          percentage_off: Math.round(dropPercentage)
        }
      })
    }

    return NextResponse.json({
      success: true,
      price: result.price,
      originalPrice: result.originalPrice || item.retail_price,
      storeName: result.storeName,
      supportLevel: result.supportLevel,
      message: previousPrice && result.price < previousPrice
        ? `Price dropped from $${previousPrice} to $${result.price}!`
        : `Price updated: $${result.price}`,
      lastChecked: new Date().toISOString()
    })

  } catch (error) {
    console.error('Manual price check error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
