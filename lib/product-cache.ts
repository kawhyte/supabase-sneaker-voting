interface CachedProduct {
  url: string
  data: any
  timestamp: number
  storeId: string
}

class ProductCache {
  private cache = new Map<string, CachedProduct>()
  private readonly CACHE_DURATION = 1000 * 60 * 15 // 15 minutes

  private generateKey(url: string): string {
    // Normalize URL by removing query parameters that don't affect the product
    try {
      const urlObj = new URL(url)
      // Remove common tracking parameters
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'gclid', 'fbclid']
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param))

      return urlObj.href.toLowerCase()
    } catch {
      return url.toLowerCase()
    }
  }

  set(url: string, data: any): void {
    const key = this.generateKey(url)
    this.cache.set(key, {
      url,
      data,
      timestamp: Date.now(),
      storeId: data.store?.id || 'unknown'
    })

    // Clean up expired entries when adding new ones
    this.cleanup()
  }

  get(url: string): any | null {
    const key = this.generateKey(url)
    const cached = this.cache.get(key)

    if (!cached) {
      return null
    }

    // Check if cache entry is still valid
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  has(url: string): boolean {
    const key = this.generateKey(url)
    const cached = this.cache.get(key)

    if (!cached) {
      return false
    }

    // Check if cache entry is still valid
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  clear(): void {
    this.cache.clear()
  }

  clearByStore(storeId: string): void {
    for (const [key, cached] of Array.from(this.cache.entries())) {
      if (cached.storeId === storeId) {
        this.cache.delete(key)
      }
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, cached] of Array.from(this.cache.entries())) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }

  getCacheStats(): { size: number; entries: Array<{ url: string; storeId: string; age: number }> } {
    const now = Date.now()
    const entries = Array.from(this.cache.values()).map(cached => ({
      url: cached.url,
      storeId: cached.storeId,
      age: Math.floor((now - cached.timestamp) / 1000) // age in seconds
    }))

    return {
      size: this.cache.size,
      entries
    }
  }
}

// Create a singleton instance
export const productCache = new ProductCache()

// Enhanced URL parser with caching
export async function parseProductWithCache(url: string, forceRefresh = false): Promise<any> {
  // Check cache first (unless force refresh is requested)
  if (!forceRefresh && productCache.has(url)) {
    console.log('📦 Using cached product data for:', url)
    return {
      ...productCache.get(url),
      fromCache: true
    }
  }

  // Parse the product (this would call your Supabase function)
  try {
    const response = await fetch('/api/parse-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      // Cache the successful result
      productCache.set(url, result)
      console.log('✅ Cached new product data for:', url)

      return {
        ...result,
        fromCache: false
      }
    } else {
      throw new Error(result.error || 'Failed to parse product')
    }

  } catch (error) {
    console.error('❌ Failed to parse product:', error)
    throw error
  }
}

// Preload products for better UX
export function preloadProducts(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(async (url) => {
      if (!productCache.has(url)) {
        try {
          await parseProductWithCache(url)
        } catch (error) {
          console.warn(`Failed to preload ${url}:`, error)
        }
      }
    })
  )
}