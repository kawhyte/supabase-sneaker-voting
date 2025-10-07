/**
 * Browserless.io Integration
 *
 * Provides browser automation for scraping JavaScript-rendered sites.
 * Free tier: 1,000 units/month (no credit card required)
 *
 * Usage:
 * 1. Sign up at https://www.browserless.io/
 * 2. Get your API key from dashboard
 * 3. Add to .env.local: BROWSERLESS_API_KEY=your_key_here
 * 4. Deploy to Vercel: Add environment variable in project settings
 */

export interface BrowserlessConfig {
  apiKey: string
  timeout?: number // milliseconds, default 30000 (30s)
  blockAds?: boolean // Block ads and trackers to save resources
  waitFor?: {
    selector?: string // Wait for specific CSS selector
    timeout?: number // Wait timeout in milliseconds
  }
}

export interface BrowserlessResult {
  html: string
  success: boolean
  error?: string
}

/**
 * Fetch a URL using Browserless.io browser automation
 * This executes JavaScript and returns the fully rendered HTML
 */
export async function fetchWithBrowser(url: string, config?: Partial<BrowserlessConfig>): Promise<BrowserlessResult> {
  const apiKey = config?.apiKey || process.env.BROWSERLESS_API_KEY

  if (!apiKey) {
    return {
      html: '',
      success: false,
      error: 'BROWSERLESS_API_KEY not configured. Please add it to your environment variables.'
    }
  }

  try {
    // Browserless.io /unblock endpoint - uses residential proxies to bypass bot protection
    const browserlessUrl = `https://production-sfo.browserless.io/unblock?token=${apiKey}&proxy=residential`

    console.log(`🌐 Browserless: Attempting to unblock ${url}...`)

    // Build request body for /unblock endpoint
    // Note: /unblock endpoint has limited options - it automatically handles waiting
    const requestBody: any = {
      url,
      browserWSEndpoint: false,
      cookies: false,
      content: true,
      screenshot: false
    }

    // Log if wait config was provided (but /unblock doesn't support it)
    if (config?.waitFor?.selector) {
      console.log(`ℹ️ Note: /unblock endpoint automatically waits for page load (waitFor selector ignored)`)
    }

    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`🌐 Browserless response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Browserless API error (${response.status}):`, errorText)
      return {
        html: '',
        success: false,
        error: `Browserless API error (${response.status}): ${errorText}`
      }
    }

    const html = await response.text()
    console.log(`✅ Browserless returned HTML (${html.length} characters)`)

    // Log first 500 characters to see what we got
    console.log('📄 HTML preview:', html.substring(0, 500))

    if (!html || html.length < 100) {
      console.error('❌ Browserless returned insufficient HTML')
      return {
        html: '',
        success: false,
        error: 'Browserless returned empty or invalid HTML'
      }
    }

    return {
      html,
      success: true
    }

  } catch (error) {
    return {
      html: '',
      success: false,
      error: `Browserless request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Smart in-memory cache for Browserless results
 * Prevents duplicate requests for the same URL within a time window
 *
 * Cache Strategy:
 * - Product metadata (name, brand, images): 24 hours (rarely changes)
 * - Default: 24 hours for most product pages
 * - Can be manually cleared via cache management
 */
interface CacheEntry {
  html: string
  timestamp: number
  ttl: number // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry>()

// Cache durations
const CACHE_TTL_PRODUCT_METADATA = 24 * 60 * 60 * 1000 // 24 hours
const CACHE_TTL_DEFAULT = 24 * 60 * 60 * 1000 // 24 hours (for product pages)
const MAX_CACHE_SIZE = 200 // Increased from 100 to support more products

/**
 * Fetch with smart caching to minimize API usage
 *
 * @param url - URL to fetch
 * @param config - Browserless configuration options
 * @param options - Cache options
 * @returns BrowserlessResult with HTML content
 */
export async function fetchWithBrowserCached(
  url: string,
  config?: Partial<BrowserlessConfig>,
  options?: {
    ttl?: number,  // Override default TTL
    bypassCache?: boolean  // Force fresh fetch
  }
): Promise<BrowserlessResult> {
  const ttl = options?.ttl || CACHE_TTL_DEFAULT
  const bypassCache = options?.bypassCache || false

  // Check cache first (unless bypassed)
  if (!bypassCache) {
    const cached = cache.get(url)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      const ageMinutes = Math.floor((Date.now() - cached.timestamp) / 1000 / 60)
      console.log(`🎯 Cache hit for ${url} (age: ${ageMinutes}m, ttl: ${cached.ttl / 1000 / 60}m)`)
      return {
        html: cached.html,
        success: true
      }
    } else if (cached) {
      console.log(`⏰ Cache expired for ${url}, fetching fresh data...`)
      cache.delete(url) // Clean up expired entry
    }
  } else {
    console.log(`🔄 Cache bypassed for ${url}, forcing fresh fetch...`)
  }

  // Fetch from Browserless
  console.log(`🌐 Fetching ${url} with Browserless...`)
  const result = await fetchWithBrowser(url, config)

  // Cache successful results
  if (result.success && result.html) {
    cache.set(url, {
      html: result.html,
      timestamp: Date.now(),
      ttl
    })

    // Clean up old cache entries (prevent memory leak)
    // Remove oldest entries when cache size exceeds limit
    if (cache.size > MAX_CACHE_SIZE) {
      const entriesToRemove = cache.size - MAX_CACHE_SIZE
      const sortedEntries = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)

      for (let i = 0; i < entriesToRemove; i++) {
        cache.delete(sortedEntries[i][0])
      }
      console.log(`🧹 Cleaned up ${entriesToRemove} old cache entries`)
    }
  }

  return result
}

/**
 * Check if Browserless is configured and available
 */
export function isBrowserlessAvailable(): boolean {
  return !!process.env.BROWSERLESS_API_KEY
}

/**
 * Get usage stats (helpful for monitoring)
 */
export function getBrowserlessStats() {
  const now = Date.now()
  const cacheDetails = Array.from(cache.entries()).map(([url, entry]) => ({
    url,
    ageMinutes: Math.floor((now - entry.timestamp) / 1000 / 60),
    ttlMinutes: Math.floor(entry.ttl / 1000 / 60),
    expired: now - entry.timestamp >= entry.ttl
  }))

  return {
    cacheSize: cache.size,
    maxCacheSize: MAX_CACHE_SIZE,
    cacheEntries: cacheDetails,
    isConfigured: isBrowserlessAvailable(),
    defaultTTLHours: CACHE_TTL_DEFAULT / 1000 / 60 / 60
  }
}

/**
 * Clear the entire cache
 * Useful for debugging or forcing fresh fetches
 */
export function clearBrowserlessCache(): void {
  const size = cache.size
  cache.clear()
  console.log(`🧹 Cleared ${size} entries from Browserless cache`)
}

/**
 * Clear a specific URL from cache
 * @param url - URL to remove from cache
 */
export function clearCacheForUrl(url: string): boolean {
  const deleted = cache.delete(url)
  if (deleted) {
    console.log(`🧹 Removed ${url} from cache`)
  }
  return deleted
}

/**
 * Export cache TTL constants for use in other modules
 */
export const CacheTTL = {
  PRODUCT_METADATA: CACHE_TTL_PRODUCT_METADATA,
  DEFAULT: CACHE_TTL_DEFAULT
} as const
