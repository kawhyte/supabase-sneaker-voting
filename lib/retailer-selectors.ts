/**
 * lib/retailer-selectors.ts
 *
 * Retailer configuration for price scraping
 * Each retailer has multiple fallback selectors to maximize success rate
 *
 * Smart Hybrid Architecture:
 * - Tier 1: Shopify JSON backdoor (100% reliable, no HTML parsing)
 * - Tier 2: Standard fetch with rotating user agents (70-80% success)
 * - Tier 3: Browserless /content for JS rendering (15-20% more)
 * - Tier 4: Browserless /unblock for anti-bot sites (residential proxies)
 * - Tier 5: Gemini AI fallback when selectors fail but HTML is fetched
 */

export interface RetailerConfig {
  domain: string               // e.g., "nike.com"
  name: string                 // Display name
  selectors: {
    price: string[]            // CSS selectors for price, tried in order
    salePrice?: string[]       // Optional sale price selectors
    availability?: string[]    // In stock indicators
  }
  requiresJS: boolean          // True if site needs JavaScript rendering
  useUnblock?: boolean         // True if site needs residential proxies (Akamai/Cloudflare bypass)
  isShopify?: boolean          // True if Shopify store (use JSON endpoint instead of HTML)
  userAgent?: string           // Custom user agent if needed
  testUrl?: string             // Test product URL for manual verification
}

export const RETAILER_CONFIGS: RetailerConfig[] = [
  // Nike - requires JS rendering
  {
    domain: 'nike.com',
    name: 'Nike',
    selectors: {
      price: [
        '[data-test="product-price"]',
        '.product-price__wrapper',
        '[class*="product-price"]',
        'meta[property="product:price:amount"]',
        'meta[property="og:price:amount"]'
      ],
      availability: ['[data-test="product-availability"]']
    },
    requiresJS: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },

  // Foot Locker - works without JS
  {
    domain: 'footlocker.com',
    name: 'Foot Locker',
    selectors: {
      price: [
        '[data-test="product-price"]',
        '.ProductPrice',
        '[itemprop="price"]',
        'meta[property="og:price:amount"]'
      ]
    },
    requiresJS: false
  },

  // Shopify stores - generic selectors
  {
    domain: 'myshopify.com',
    name: 'Shopify Store',
    selectors: {
      price: [
        '[data-product-price]',
        '.price',
        '.product-price',
        'meta[property="og:price:amount"]',
        '[itemprop="price"]'
      ]
    },
    requiresJS: false
  },

  // Champs Sports
  {
    domain: 'champssports.com',
    name: 'Champs Sports',
    selectors: {
      price: [
        '[data-test="product-price"]',
        '.ProductPrice',
        '[class*="price"]',
        '[itemprop="price"]'
      ]
    },
    requiresJS: false
  },

  // Hibbett Sports
  {
    domain: 'hibbett.com',
    name: 'Hibbett Sports',
    selectors: {
      price: [
        '.product-price',
        '[data-price]',
        '[itemprop="price"]',
        'meta[property="og:price:amount"]'
      ]
    },
    requiresJS: false
  },

  // Dick's Sporting Goods - requires JS
  {
    domain: 'dickssportinggoods.com',
    name: "Dick's Sporting Goods",
    selectors: {
      price: [
        '[data-testid="product-price"]',
        '.dsg-price',
        '[class*="price"]',
        'meta[property="og:price:amount"]'
      ]
    },
    requiresJS: true
  },

  // Old Navy - requires JS (Gap Inc. brand)
  {
    domain: 'oldnavy.gap.com',
    name: 'Old Navy',
    selectors: {
      price: [
        '[data-test="product-price"]',
        '.product-price',
        '[class*="ProductPrice"]',
        '[data-price]',
        'meta[property="og:price:amount"]'
      ]
    },
    requiresJS: true
  },

  // Shoe Palace
  {
    domain: 'shoepalace.com',
    name: 'Shoe Palace',
    selectors: {
      price: [
        '.product-price',
        '[data-product-price]',
        '[itemprop="price"]',
        'meta[property="og:price:amount"]',
        '[class*="price"]'
      ]
    },
    requiresJS: false
  },

  // Stance (socks/apparel)
  {
    domain: 'stance.com',
    name: 'Stance',
    selectors: {
      price: [
        '[data-product-price]',
        '.product-price',
        '.price',
        'meta[property="og:price:amount"]',
        '[itemprop="price"]'
      ]
    },
    requiresJS: false
  },

  // Bath & Body Works
  {
    domain: 'bathandbodyworks.com',
    name: 'Bath & Body Works',
    selectors: {
      price: [
        '.product-price',
        '[data-price]',
        '[itemprop="price"]',
        'meta[property="og:price:amount"]',
        '[class*="price"]'
      ]
    },
    requiresJS: false
  },

  // House of Heat (shoe retailer/marketplace)
  {
    domain: 'houseofheat.co',
    name: 'House of Heat',
    selectors: {
      price: [
        '.product-price',
        '[data-product-price]',
        '[itemprop="price"]',
        'meta[property="og:price:amount"]'
      ]
    },
    requiresJS: false
  },

  // ========== NEW RETAILERS (Smart Hybrid Architecture) ==========

  // Gymshark - Shopify store (JSON endpoint blocked, uses HTML scraping)
  {
    domain: 'gymshark.com',
    name: 'Gymshark',
    selectors: {
      price: [
        '.product-price__item',
        '.price',
        '[data-product-price]',
        'meta[property="og:price:amount"]',
        '[itemprop="price"]'
      ]
    },
    requiresJS: false,  // Standard fetch works, but JSON endpoint is blocked
    isShopify: false,  // Can't use .json backdoor (Gymshark blocks it)
    testUrl: 'https://www.gymshark.com/products/gymshark-twist-front-bralette-white-aw24'
  },

  // GOAT - Aggressive anti-bot (Akamai), needs residential proxies
  {
    domain: 'goat.com',
    name: 'GOAT',
    selectors: {
      price: [
        '[data-testid="product-price"]',
        '.product-price',
        '[class*="price"]',
        'meta[property="og:price:amount"]',
        '[itemprop="price"]'
      ]
    },
    requiresJS: true,
    useUnblock: true,  // Use Browserless /unblock with residential proxy
    testUrl: 'https://www.goat.com/sneakers/air-jordan-11-retro-rare-air-ih0296-400'
  },

  // Sole Retriever - Static HTML friendly, standard fetch works
  {
    domain: 'soleretriever.com',
    name: 'Sole Retriever',
    selectors: {
      price: [
        '.price',
        '[class*="price"]',
        '[data-price]',
        'meta[property="og:price:amount"]',
        '[itemprop="price"]'
      ]
    },
    requiresJS: false,  // Simple cheerio scraping works
    testUrl: 'https://www.soleretriever.com/sneaker-release-dates/nike/kobe-9/nike-kobe-9-em-protro-china-ih1400-600'
  }
]

/**
 * Get retailer configuration from URL
 */
export function getRetailerConfig(url: string): RetailerConfig | null {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')

    // Find exact domain match
    const config = RETAILER_CONFIGS.find(c => hostname.includes(c.domain))
    if (config) return config

    // Return null if no match (will use generic selectors)
    return null
  } catch (error) {
    console.error('Invalid URL:', url)
    return null
  }
}

/**
 * Parse price string to number
 * Handles: $99.99, €99,99, ¥9,999, £99.99, etc.
 */
export function parsePrice(priceString: string): number | null {
  if (!priceString) return null

  // Remove all non-numeric characters except decimal point and comma
  let cleaned = priceString.replace(/[^0-9.,]/g, '')

  // Handle European format (comma as decimal separator)
  if (cleaned.match(/,\d{2}$/)) {
    cleaned = cleaned.replace(',', '.')
  }

  // Remove thousands separators
  cleaned = cleaned.replace(/,/g, '')

  const price = parseFloat(cleaned)
  return isNaN(price) || price === 0 ? null : price
}

/**
 * Validate price is reasonable (not $0, not extreme values)
 * @param price - The scraped price
 * @param itemRetailPrice - Optional retail price for comparison
 * @returns true if price is valid, false otherwise
 */
export function validatePrice(price: number, itemRetailPrice?: number): boolean {
  // Reject zero or negative prices
  if (price <= 0) return false

  // Reject extremely high prices (likely scraping error)
  if (price > 50000) return false

  // If we have a retail price, reject prices more than 200% markup
  // (likely scraping error - got wrong number)
  if (itemRetailPrice && price > itemRetailPrice * 2) return false

  // Reject prices below $1 (likely cents instead of dollars)
  if (price < 1) return false

  return true
}

/**
 * Generic selectors for unknown retailers
 */
export const GENERIC_SELECTORS = {
  price: [
    '[itemprop="price"]',
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    '.price',
    '[class*="price"]',
    '[data-price]',
    '[data-product-price]'
  ]
}

/**
 * Error categories for better debugging
 */
export type ErrorCategory =
  | 'network_error'      // fetch failed
  | 'parse_error'        // HTML parsed but no price found
  | 'bot_detection'      // 403, 429, Cloudflare challenge
  | 'timeout'            // request timed out
  | 'invalid_price'      // price found but failed validation
  | 'unknown'            // unclassified error

/**
 * Categorize error for monitoring
 */
export function categorizeError(error: string, statusCode?: number): ErrorCategory {
  if (statusCode === 403 || statusCode === 429) return 'bot_detection'
  if (statusCode && statusCode >= 500) return 'network_error'
  if (error.includes('timeout') || error.includes('timed out')) return 'timeout'
  if (error.includes('price not found') || error.includes('Could not find')) return 'parse_error'
  if (error.includes('validation failed') || error.includes('invalid price')) return 'invalid_price'
  if (error.includes('fetch') || error.includes('network')) return 'network_error'
  return 'unknown'
}

/**
 * Per-retailer monitoring stats
 */
export interface RetailerStats {
  domain: string
  name: string
  successCount: number
  failureCount: number
  lastSuccess: string | null
  lastFailure: string | null
  successRate: number // 0-100
}
