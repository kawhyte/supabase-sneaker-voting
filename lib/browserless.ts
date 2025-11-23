/**
 * Browserless.io Integration
 * * Updated to support "Smart Stealth" mode:
 * Combining /content endpoint (for waitFor) with Residential Proxies (for Akamai bypass)
 */

export interface BrowserlessConfig {
  apiKey: string
  timeout?: number // milliseconds, default 30000 (30s)
  blockAds?: boolean // Block ads and trackers to save resources
  waitFor?: {
    selector?: string // Wait for specific CSS selector
    timeout?: number // Wait timeout in milliseconds
  }
  endpoint?: 'unblock' | 'content' // Which Browserless endpoint to use
  useResidentialProxy?: boolean // Force residential proxy (CRITICAL for Lululemon/Goat)
}

export interface BrowserlessResult {
  html: string
  success: boolean
  error?: string
}

// Cache definitions
interface CacheEntry {
  html: string
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_DEFAULT = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE = 200

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
    // Default to 'content' for better control, unless 'unblock' is explicitly requested
    const endpoint = config?.endpoint || 'content'
    
    // Use residential proxy if explicitly requested OR if using /unblock endpoint
    // This allows us to use /content (which supports waitFor) + Proxies (which pass Akamai)
    const useResidentialProxy = config?.useResidentialProxy || endpoint === 'unblock'

    // Construct URL with proxy flag if needed
    const browserlessUrl = `https://production-sfo.browserless.io/${endpoint}?token=${apiKey}${useResidentialProxy ? '&proxy=residential' : ''}`

    console.log(`🌐 Browserless: Using /${endpoint} endpoint for ${url}...`)
    if (useResidentialProxy) console.log(`🛡️ Stealth Mode: Residential Proxy Enabled`)

    // Build request body based on endpoint
    let requestBody: any

    if (endpoint === 'content') {
      // /content endpoint supports full Puppeteer options including waitFor
      requestBody = {
        url,
        gotoOptions: {
          waitUntil: 'networkidle2', // Wait for network to be mostly idle
          timeout: config?.timeout || 30000
        }
      }

      // Add waitForSelector if specified (waits for specific element to appear)
      if (config?.waitFor?.selector) {
        requestBody.waitForSelector = {
          selector: config.waitFor.selector,
          timeout: config.waitFor.timeout || 15000
        }
        console.log(`⏳ Waiting for selector: ${config.waitFor.selector}`)
      }

      // Add waitForTimeout to ensure JS has time to execute (2 seconds after network idle)
      requestBody.waitForTimeout = 2000

    } else {
      // /unblock endpoint has limited options but better bot bypass
      // (Note: It ignores waitForSelector)
      requestBody = {
        url,
        browserWSEndpoint: false,
        cookies: false,
        content: true,
        screenshot: false
      }

      if (config?.waitFor?.selector) {
        console.log(`ℹ️ Note: /unblock endpoint doesn't support waitFor (selector ignored)`)
      }
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

    // Log first 100 characters to verify content
    console.log('📄 HTML preview:', html.substring(0, 100).replace(/\n/g, ' '))

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

export async function fetchWithBrowserCached(
  url: string,
  config?: Partial<BrowserlessConfig>,
  options?: {
    ttl?: number,
    bypassCache?: boolean
  }
): Promise<BrowserlessResult> {
  const ttl = options?.ttl || CACHE_TTL_DEFAULT
  const bypassCache = options?.bypassCache || false

  if (!bypassCache) {
    const cached = cache.get(url)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      const ageMinutes = Math.floor((Date.now() - cached.timestamp) / 1000 / 60)
      console.log(`🎯 Cache hit for ${url} (age: ${ageMinutes}m)`)
      return { html: cached.html, success: true }
    } else if (cached) {
      cache.delete(url)
    }
  }

  const result = await fetchWithBrowser(url, config)

  if (result.success && result.html) {
    cache.set(url, {
      html: result.html,
      timestamp: Date.now(),
      ttl
    })

    if (cache.size > MAX_CACHE_SIZE) {
      const entriesToRemove = cache.size - MAX_CACHE_SIZE
      const sortedEntries = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)
      for (let i = 0; i < entriesToRemove; i++) {
        cache.delete(sortedEntries[i][0])
      }
    }
  }

  return result
}

export function isBrowserlessAvailable(): boolean {
  return !!process.env.BROWSERLESS_API_KEY
}