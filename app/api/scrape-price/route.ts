import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface PriceData {
  price?: number
  originalPrice?: number
  inStock: boolean
  storeName: string
  success: boolean
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const hostname = validUrl.hostname.toLowerCase()

    // Route to appropriate scraper based on hostname
    let priceData: PriceData

    if (hostname.includes('shoepalace.com')) {
      priceData = await scrapeShoePalace(url)
    } else if (hostname.includes('hibbett.com')) {
      priceData = await scrapeHibbett(url)
    } else if (hostname.includes('jdsports.com')) {
      priceData = await scrapeJDSports(url)
    } else {
      priceData = await scrapeGenericPrice(url)
    }

    return NextResponse.json(priceData)

  } catch (error) {
    console.error('Price scraping error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to scrape price data' },
      { status: 500 }
    )
  }
}

async function scrapeShoePalace(url: string): Promise<PriceData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    let price: number | undefined
    let originalPrice: number | undefined

    // Priority 1: Try to extract from Open Graph meta tags
    const ogPriceAmount = $('meta[property="og:price:amount"]').attr('content')
    if (ogPriceAmount) {
      price = parseFloat(ogPriceAmount)
    }

    // Priority 2: Try to extract from JSON-LD or inline JSON data
    if (!price) {
      const scriptTags = $('script').toArray()
      for (const script of scriptTags) {
        const scriptContent = $(script).html() || ''

        // Look for price data in JSON
        const priceMatches = scriptContent.match(/"price":\s*{\s*"amount":\s*([\d.]+)/g)
        if (priceMatches && priceMatches.length > 0) {
          const priceValue = priceMatches[0].match(/[\d.]+/)
          if (priceValue) {
            price = parseFloat(priceValue[0])
            break
          }
        }

        // Also check for price in cents format
        const centsPriceMatches = scriptContent.match(/"price":\s*(\d+)/g)
        if (centsPriceMatches && centsPriceMatches.length > 0) {
          const centsValue = centsPriceMatches[0].match(/\d+/)
          if (centsValue) {
            const centsPrice = parseInt(centsValue[0])
            if (centsPrice > 1000) { // Likely in cents if > $10
              price = centsPrice / 100
              break
            }
          }
        }
      }
    }

    // Priority 3: CSS selector fallback (only if JSON/meta methods failed)
    if (!price) {
      // Shoe Palace specific selectors - prioritize sale prices
      const salePriceSelectors = [
        '.price-current',
        '.sale-price',
        '.discounted-price',
        '[class*="sale"]',
        '.price .money:last-child',  // Often the sale price is the last money element
        '.price span:last-child'
      ]

      const regularPriceSelectors = [
        '.product-price',
        '.price',
        '[class*="price"]:not([class*="original"]):not([class*="was"])',
        '.money'
      ]

      // Try to find sale price first
      let priceText = ''

      // Look for sale price indicators
      for (const selector of salePriceSelectors) {
        const found = $(selector).first().text().trim()
        if (found && extractPrice(found)) {
          priceText = found
          break
        }
      }

      // If no sale price found, try regular price selectors
      if (!priceText) {
        for (const selector of regularPriceSelectors) {
          const found = $(selector).first().text().trim()
          if (found && extractPrice(found)) {
            priceText = found
            break
          }
        }
      }

      price = extractPrice(priceText)
    }

    // Try to find original price using selectors
    const originalPriceSelectors = [
      '.price-original',
      '.price-was',
      '[class*="original-price"]',
      '.was-price',
      '.compare-at-price',
      '.price .money:first-child'  // Often the original price is the first money element
    ]

    for (const selector of originalPriceSelectors) {
      const found = $(selector).first().text().trim()
      if (found && extractPrice(found)) {
        originalPrice = extractPrice(found)
        break
      }
    }

    const stockSelector = '.in-stock, .out-of-stock, [class*="stock"], [class*="availability"]'
    const stockText = $(stockSelector).first().text().toLowerCase()

    // Check stock status
    const inStock = !stockText.includes('out of stock') &&
                   !stockText.includes('sold out') &&
                   !stockText.includes('unavailable')

    return {
      price,
      originalPrice,
      inStock,
      storeName: 'Shoe Palace',
      success: true
    }
  } catch (error) {
    return {
      price: undefined,
      inStock: false,
      storeName: 'Shoe Palace',
      success: false,
      error: `Shoe Palace scraping failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

async function scrapeHibbett(url: string): Promise<PriceData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Hibbett specific selectors
    const priceSelector = '.product-price, .price-current, [data-testid="price"]'
    const originalPriceSelector = '.price-was, .price-original, [data-testid="original-price"]'
    const stockSelector = '.stock-status, .availability, [data-testid="stock"]'

    const priceText = $(priceSelector).first().text().trim()
    const originalPriceText = $(originalPriceSelector).first().text().trim()
    const stockText = $(stockSelector).first().text().toLowerCase()

    const price = extractPrice(priceText)
    const originalPrice = extractPrice(originalPriceText)

    const inStock = !stockText.includes('out of stock') &&
                   !stockText.includes('sold out') &&
                   !stockText.includes('unavailable')

    return {
      price,
      originalPrice,
      inStock,
      storeName: 'Hibbett',
      success: true
    }
  } catch (error) {
    return {
      price: undefined,
      inStock: false,
      storeName: 'Hibbett',
      success: false,
      error: `Hibbett scraping failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

async function scrapeJDSports(url: string): Promise<PriceData> {
  const maxRetries = 2

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add random delay between attempts
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        if (attempt === maxRetries) {
          throw new Error(`HTTP ${response.status}`)
        }
        continue // Try again
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // JD Sports specific selectors - try multiple variations
      const priceSelectors = [
        '.itemPrice, .product-price, [data-e2e="pdp-product-price"]',
        '.price, [class*="price"], .cost',
        '.pdp-price, .product-price-container',
        '[data-testid="price"], [aria-label*="price"]'
      ]

      let priceText = ''
      for (const selector of priceSelectors) {
        priceText = $(selector).first().text().trim()
        if (priceText) break
      }

      const originalPriceSelector = '.was-price, .price-was, [data-e2e="pdp-was-price"]'
      const stockSelector = '.stock-msg, .availability-msg, [data-e2e="stock-status"]'

      const originalPriceText = $(originalPriceSelector).first().text().trim()
      const stockText = $(stockSelector).first().text().toLowerCase()

      const price = extractPrice(priceText)
      const originalPrice = extractPrice(originalPriceText)

      const inStock = !stockText.includes('out of stock') &&
                     !stockText.includes('sold out') &&
                     !stockText.includes('unavailable')

      // If we got a price, return success
      if (price) {
        return {
          price,
          originalPrice,
          inStock,
          storeName: 'JD Sports',
          success: true
        }
      }

      // If no price found and it's the last attempt, return failure
      if (attempt === maxRetries) {
        throw new Error('No price found with any selector')
      }

    } catch (error) {
      if (attempt === maxRetries) {
        return {
          price: undefined,
          inStock: false,
          storeName: 'JD Sports',
          success: false,
          error: `JD Sports scraping failed: ${error instanceof Error ? error.message : String(error)}`
        }
      }
    }
  }

  // Fallback return (should never reach here)
  return {
    price: undefined,
    inStock: false,
    storeName: 'JD Sports',
    success: false,
    error: 'JD Sports scraping failed: Maximum retries exceeded'
  }
}

async function scrapeGenericPrice(url: string): Promise<PriceData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Generic price selectors
    const priceText = $('.price, [class*="price"], .cost, [class*="cost"]').first().text().trim()
    const stockText = $('[class*="stock"], [class*="availability"]').first().text().toLowerCase()

    const price = extractPrice(priceText)
    const inStock = !stockText.includes('out of stock') &&
                   !stockText.includes('sold out') &&
                   !stockText.includes('unavailable')

    const hostname = new URL(url).hostname
    const storeName = hostname.replace('www.', '').replace('.com', '')

    return {
      price,
      inStock,
      storeName,
      success: true
    }
  } catch (error) {
    return {
      price: undefined,
      inStock: false,
      storeName: 'Unknown Store',
      success: false,
      error: `Generic price scraping failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

function extractPrice(priceText: string): number | undefined {
  if (!priceText) return undefined

  // Remove currency symbols and extra text, extract numbers
  const cleaned = priceText.replace(/[^\d.,]/g, '')
  const priceMatch = cleaned.match(/[\d,]+\.?\d*/g)

  if (priceMatch) {
    const price = parseFloat(priceMatch[0].replace(/,/g, ''))
    return isNaN(price) ? undefined : price
  }

  return undefined
}