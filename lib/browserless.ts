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
  stealth?: boolean // Use stealth mode to avoid detection
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

  const timeout = config?.timeout || 30000
  const blockAds = config?.blockAds !== undefined ? config.blockAds : true
  const stealth = config?.stealth !== undefined ? config.stealth : true

  try {
    // Browserless.io REST API endpoint
    const browserlessUrl = `https://chrome.browserless.io/content?token=${apiKey}`

    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        gotoOptions: {
          waitUntil: 'networkidle2', // Wait for network to be idle
          timeout
        },
        // Block ads and trackers to save resources and speed up
        rejectResourceTypes: blockAds ? ['image', 'media', 'font', 'stylesheet'] : [],
        // Stealth mode to avoid bot detection
        stealth,
        // Wait for specific selectors (common product page patterns)
        waitForSelector: {
          selector: 'h1, [class*="product"], [class*="title"]',
          timeout: 10000
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        html: '',
        success: false,
        error: `Browserless API error (${response.status}): ${errorText}`
      }
    }

    const html = await response.text()

    if (!html || html.length < 100) {
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
 * Simple in-memory cache for Browserless results
 * Prevents duplicate requests for the same URL within a time window
 */
interface CacheEntry {
  html: string
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch with caching to minimize API usage
 */
export async function fetchWithBrowserCached(url: string, config?: Partial<BrowserlessConfig>): Promise<BrowserlessResult> {
  // Check cache first
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`🎯 Cache hit for ${url}`)
    return {
      html: cached.html,
      success: true
    }
  }

  // Fetch from Browserless
  console.log(`🌐 Fetching ${url} with Browserless...`)
  const result = await fetchWithBrowser(url, config)

  // Cache successful results
  if (result.success && result.html) {
    cache.set(url, {
      html: result.html,
      timestamp: Date.now()
    })

    // Clean up old cache entries (prevent memory leak)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value
      if (oldestKey) cache.delete(oldestKey)
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
  return {
    cacheSize: cache.size,
    cacheEntries: Array.from(cache.keys()),
    isConfigured: isBrowserlessAvailable()
  }
}
