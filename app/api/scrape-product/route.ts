import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { ItemCategory } from '@/components/types/item-category'
import { fetchWithBrowserCached, isBrowserlessAvailable } from '@/lib/browserless'
import { extractWithGemini, isGeminiAvailable } from '@/lib/gemini-fallback'
import { fetchShopifyProduct, isShopifyUrl } from '@/lib/shopify-json-fetcher'
import { getRetailerConfig } from '@/lib/retailer-selectors'

interface ProductData {
  brand?: string
  model?: string
  colorway?: string
  sku?: string
  retailPrice?: number
  salePrice?: number
  images?: string[]
  category?: ItemCategory
  success: boolean
  error?: string
  rawHtml?: string // For Gemini AI fallback (when CSS selectors fail)
}

// Helper function to clean text
function cleanText(text: string | undefined | null): string {
  if (!text) return ''

  let cleaned = text
    .replace(/[\n\t\r]/g, ' ')  // Replace newlines and tabs with spaces
    .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
    .trim()                       // Remove leading/trailing whitespace

  // Remove common cookie/privacy banner text patterns
  const bannersToRemove = [
    /this website uses cookies.*/gi,
    /we use cookies.*/gi,
    /by using this site.*/gi,
    /accept.*cookies.*/gi,
    /cookie.*policy.*/gi,
    /privacy.*policy.*/gi,
    /preferences.*reject.*accept/gi,
    /cookie.*settings/gi,
  ]

  bannersToRemove.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  // Clean up any resulting extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

// Helper function to detect category from product title and URL
function detectCategory(url: string, title: string, breadcrumbs: string = ''): ItemCategory {
  const combined = `${url} ${title} ${breadcrumbs}`.toLowerCase()

  // Shoes - check first
  if (
    combined.includes('shoe') ||
    combined.includes('sneaker') ||
    combined.includes('boot') ||
    combined.includes('sandal') ||
    combined.includes('slipper') ||
    combined.includes('loafer') ||
    combined.includes('heel') ||
    combined.includes('footwear')
  ) {
    return 'shoes'
  }

  // Tops
  if (
    combined.includes('shirt') ||
    combined.includes('blouse') ||
    combined.includes('top') ||
    combined.includes('sweater') ||
    combined.includes('hoodie') ||
    combined.includes('sweatshirt') ||
    combined.includes('tee') ||
    combined.includes('tank') ||
    combined.includes('cardigan') ||
    combined.includes('polo')
  ) {
    return 'tops'
  }

  // Bottoms
  if (
    combined.includes('pant') ||
    combined.includes('jean') ||
    combined.includes('short') ||
    combined.includes('skirt') ||
    combined.includes('trouser') ||
    combined.includes('legging') ||
    combined.includes('jogger')
  ) {
    return 'bottoms'
  }

  // Outerwear
  if (
    combined.includes('jacket') ||
    combined.includes('coat') ||
    combined.includes('blazer') ||
    combined.includes('parka') ||
    combined.includes('windbreaker') ||
    combined.includes('bomber') ||
    combined.includes('trench') ||
    combined.includes('peacoat')
  ) {
    return 'outerwear'
  }

  // Jewelry & Watches (map to accessories)
  if (
    combined.includes('jewelry') ||
    combined.includes('necklace') ||
    combined.includes('bracelet') ||
    combined.includes('ring') ||
    combined.includes('earring') ||
    combined.includes('pendant') ||
    combined.includes('watch') ||
    combined.includes('timepiece')
  ) {
    return 'accessories'
  }

  // Accessories (catch-all for bags, hats, etc.)
  if (
    combined.includes('bag') ||
    combined.includes('backpack') ||
    combined.includes('purse') ||
    combined.includes('wallet') ||
    combined.includes('belt') ||
    combined.includes('hat') ||
    combined.includes('cap') ||
    combined.includes('scarf') ||
    combined.includes('glove') ||
    combined.includes('sunglass') ||
    combined.includes('accessory') ||
    combined.includes('duffle') ||
    combined.includes('weekender') ||
    combined.includes('tote') ||
    combined.includes('crossbody') ||
    combined.includes('shoulder bag')
  ) {
    return 'accessories'
  }

  // Default to accessories for unknown items
  return 'accessories'
}

// Helper to retry scraping with Browserless if initial attempt fails
async function scrapeWithFallback(
  url: string,
  scraperFn: (url: string) => Promise<ProductData>,
  siteName: string,
  options?: {
    skipCheerio?: boolean, // Skip cheerio attempt and go straight to Browserless
    browserlessConfig?: {
      endpoint?: 'unblock' | 'content' // Which Browserless endpoint to use
      waitFor?: { selector: string; timeout?: number }
      timeout?: number
    },
    customExtractor?: (html: string, url: string) => ProductData // Custom HTML extractor
  }
): Promise<ProductData> {
  // Option to skip cheerio and go straight to Browserless (for known JS-heavy sites)
  if (!options?.skipCheerio) {
    // First attempt: Regular fetch + cheerio
    console.log(`📡 Attempting cheerio scrape for ${siteName}...`)
    const firstAttempt = await scraperFn(url)

    // If successful, return immediately
    if (firstAttempt.success && firstAttempt.brand && firstAttempt.retailPrice) {
      console.log(`✅ Cheerio scrape successful for ${siteName}`)
      return firstAttempt
    }
    console.log(`⚠️ Cheerio failed for ${siteName}, will try Browserless...`)
  } else {
    console.log(`⏭️ Skipping cheerio for ${siteName}, using Browserless directly...`)
  }

  // If cheerio failed and Browserless is available, try with browser automation
  if (!isBrowserlessAvailable()) {
    console.log(`⚠️ Browserless not configured for ${siteName}`)
    return {
      success: false,
      error: 'Browserless is not configured. Add BROWSERLESS_API_KEY to enable browser automation for dynamic sites.'
    }
  }

  // Try with Browserless
  console.log(`🌐 Fetching ${siteName} with Browserless automation...`)

  try {
    const browserResult = await fetchWithBrowserCached(url, options?.browserlessConfig)

    if (!browserResult.success || !browserResult.html) {
      return {
        success: false,
        error: `Browserless failed: ${browserResult.error || 'Unknown error'}`
      }
    }

    console.log(`🔍 Parsing Browserless HTML for ${siteName}... (${browserResult.html.length} chars)`)

    // Use custom extractor if provided, otherwise use generic one
    let productData: ProductData
    if (options?.customExtractor) {
      productData = options.customExtractor(browserResult.html, url)
    } else {
      const $ = cheerio.load(browserResult.html)
      productData = extractProductDataFromHtml($, url, siteName)
    }

    if (productData.success) {
      console.log(`✅ Browserless scrape successful for ${siteName}`)
    }

    return productData

  } catch (browserError) {
    console.error(`❌ Browserless error for ${siteName}:`, browserError)
    return {
      success: false,
      error: `Browserless automation failed: ${browserError instanceof Error ? browserError.message : 'Unknown error'}`
    }
  }
}

// Extract product data from cheerio instance (works with both regular and Browserless HTML)
function extractProductDataFromHtml($: cheerio.Root, url: string, siteName: string): ProductData {
  try {
    console.log(`🔍 Extracting product data from ${siteName} HTML...`)

    // Extract title
    const title = cleanText(
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('.product-title, [class*="product-title"], [class*="productTitle"]').first().text()
    )

    console.log(`📌 Extracted title: "${title}"`)

    if (!title) {
      console.error(`❌ No title found for ${siteName}`)
      return {
        success: false,
        error: `Could not extract product title from ${siteName} even with browser automation. The page structure may have changed.`
      }
    }

    // Extract brand (first word of title or from meta)
    const brand = cleanText(
      $('meta[property="product:brand"]').attr('content') ||
      title.split(' ')[0]
    )

    // Extract prices
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Try JSON-LD first
    const jsonLdScript = $('script[type="application/ld+json"]').html()
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript)
        if (jsonLd.offers) {
          const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers
          retailPrice = parseFloat(offers.price || offers.highPrice)
          salePrice = offers.lowPrice ? parseFloat(offers.lowPrice) : undefined
        }
      } catch (e) {
        // JSON-LD parsing failed
      }
    }

    // Fallback to HTML selectors
    if (!retailPrice) {
      const priceText = cleanText(
        $('.price, [class*="price"], [class*="Price"]').first().text() ||
        $('meta[property="product:price:amount"]').attr('content')
      )
      console.log(`💰 Price text found: "${priceText}"`)
      retailPrice = extractPrice(priceText)
      console.log(`💰 Extracted retail price: $${retailPrice}`)
    }

    // Extract images
    const images: string[] = []
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) {
      images.push(ogImage)
    }

    $('img[src*="product"], img[class*="product"], picture img').each((_, el) => {
      if (images.length >= 5) return false
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('logo') && !images.includes(src)) {
        const fullUrl = src.startsWith('http') ? src : new URL(src, url).href
        images.push(fullUrl)
      }
    })

    // Extract colorway
    const colorway = cleanText(
      $('[class*="color"], [class*="Color"]').first().text() ||
      $('meta[property="product:color"]').attr('content')
    )

    // Detect category
    const category = detectCategory(url, title, '')

    const productData: ProductData = {
      brand: brand || undefined,
      model: title || undefined,
      colorway: colorway || undefined,
      sku: undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate
    const validation = validateProductData(productData, siteName)
    if (!validation.isValid) {
      console.warn(`⚠️ ${siteName} Browserless extraction validation issues:`, validation.issues)
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted via browser automation. Issues: ${validation.issues.join(', ')}`
      } else {
        return {
          success: false,
          error: `Browser automation failed to extract sufficient data. Issues: ${validation.issues.join(', ')}`
        }
      }
    }

    console.log(`✅ ${siteName} product data extracted:`, {
      brand: productData.brand,
      model: productData.model?.substring(0, 50),
      retailPrice: productData.retailPrice,
      salePrice: productData.salePrice,
      imageCount: productData.images?.length,
      category: productData.category
    })

    return productData

  } catch (error) {
    return {
      success: false,
      error: `Failed to parse browser-rendered HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
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
        { success: false, error: 'Invalid URL format. Please provide a valid product URL.' },
        { status: 400 }
      )
    }

    // Validate URL protocol
    if (!validUrl.protocol.startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL protocol. Use http:// or https://' },
        { status: 400 }
      )
    }

    const hostname = validUrl.hostname.toLowerCase()

    // Route to appropriate scraper based on hostname with timeout
    let productData: ProductData

    const scrapeWithTimeout = async (scraperFn: () => Promise<ProductData>, timeoutMs: number = 15000) => {
      return Promise.race([
        scraperFn(),
        new Promise<ProductData>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout - website took too long to respond')), timeoutMs)
        )
      ])
    }

    try {
      // ========== SMART HYBRID ARCHITECTURE ==========

      // TIER 1: Gymshark - Shopify store with blocked JSON endpoint
      if (hostname.includes('gymshark.com')) {
        productData = await scrapeWithTimeout(() => scrapeGymshark(url), 20000)
      }
      // TIER 1.5: Other Shopify stores (JSON backdoor works for most)
      else if (isShopifyUrl(url)) {
        console.log(`🛍️ Detected Shopify store: ${hostname}`)
        const shopifyData = await scrapeWithTimeout(() => fetchShopifyProduct(url))
        if (shopifyData.success) {
          // Convert ShopifyProductData to ProductData format
          productData = {
            ...shopifyData,
            success: true
          }
        } else {
          // Fallback to standard scraping if JSON fetch fails
          console.warn(`⚠️ Shopify JSON failed, falling back to HTML scraping...`)
          productData = await scrapeWithTimeout(() => scrapeGeneric(url))
        }
      }
      // TIER 2: Anti-Bot Sites (GOAT, Lululemon) - Use Browserless /unblock
      else if (hostname.includes('goat.com')) {
        productData = await scrapeWithTimeout(() => scrapeGOAT(url), 25000)
      }
      else if (hostname.includes('lululemon.com')) {
        productData = await scrapeWithTimeout(() => scrapeLululemon(url), 25000)
      }
      // TIER 3: Hollister - Use Browserless /content (updated domain)
      else if (hostname.includes('hollisterco.com')) {
        productData = await scrapeWithTimeout(() => scrapeHollister(url), 20000)
      }
      // TIER 4: Sole Retriever - Standard fetch works
      else if (hostname.includes('soleretriever.com')) {
        productData = await scrapeWithTimeout(() => scrapeSoleRetriever(url))
      }
      // Sites that work well with cheerio (no fallback needed)
      else if (hostname.includes('shoepalace.com') || hostname.includes('beistravel.com')) {
        if (hostname.includes('shoepalace.com')) {
          productData = await scrapeWithTimeout(() => scrapeShoePalace(url))
        } else {
          productData = await scrapeWithTimeout(() => scrapeBEIS(url))
        }
      }
      // Sites that likely need Browserless fallback
      else if (hostname.includes('nike.com')) {
        productData = await scrapeWithTimeout(() => scrapeWithFallback(url, scrapeNike, 'Nike'), 20000)
      } else if (hostname.includes('adidas.com')) {
        // Adidas has strong bot protection - skip scraping
        return NextResponse.json({
          success: false,
          error: 'Adidas auto-import is currently unavailable due to bot protection. Please enter product details manually or use an alternative source like SoleRetriever.com or ShoePalace.com'
        })
      } else if (hostname.includes('stockx.com')) {
        productData = await scrapeWithTimeout(() => scrapeWithFallback(url, scrapeStockX, 'StockX'))
      } else if (hostname.includes('bananarepublic.gap.com')) {
        // NOTE: Gap family sites (Old Navy, Gap, Banana Republic) have aggressive bot detection
        // that blocks automation. Both /unblock and /content endpoints are blocked.
        // Current implementation attempts scraping but success rate is very low (~0-10%).
        // RECOMMENDATION: Use manual entry or alternative sources (SoleRetriever) for these sites.
        productData = await scrapeWithTimeout(() => scrapeWithFallback(
          url,
          (u) => scrapeGapFamily(u, 'Banana Republic'),
          'Banana Republic',
          {
            skipCheerio: true, // Skip cheerio, go straight to Browserless
            browserlessConfig: {
              endpoint: 'content', // Use /content for better JS rendering
              waitFor: { selector: 'h1, [data-testid="product-title"]', timeout: 15000 },
              timeout: 30000
            },
            customExtractor: (html, u) => extractGapFamilyData(html, u, 'Banana Republic')
          }
        ), 35000)
      } else if (hostname.includes('oldnavy.gap.com')) {
        // NOTE: Gap family sites (Old Navy, Gap, Banana Republic) have aggressive bot detection
        // that blocks automation. Both /unblock and /content endpoints are blocked.
        // Current implementation attempts scraping but success rate is very low (~0-10%).
        // RECOMMENDATION: Use manual entry or alternative sources (SoleRetriever) for these sites.
        productData = await scrapeWithTimeout(() => scrapeWithFallback(
          url,
          (u) => scrapeGapFamily(u, 'Old Navy'),
          'Old Navy',
          {
            skipCheerio: true, // Skip cheerio, go straight to Browserless
            browserlessConfig: {
              endpoint: 'content', // Use /content for better JS rendering
              waitFor: { selector: 'h1, [data-testid="product-title"]', timeout: 15000 },
              timeout: 30000
            },
            customExtractor: (html, u) => extractGapFamilyData(html, u, 'Old Navy')
          }
        ), 35000)
      } else if (hostname.includes('gap.com')) {
        // NOTE: Gap family sites (Old Navy, Gap, Banana Republic) have aggressive bot detection
        // that blocks automation. Both /unblock and /content endpoints are blocked.
        // Current implementation attempts scraping but success rate is very low (~0-10%).
        // RECOMMENDATION: Use manual entry or alternative sources (SoleRetriever) for these sites.
        productData = await scrapeWithTimeout(() => scrapeWithFallback(
          url,
          (u) => scrapeGapFamily(u, 'Gap'),
          'Gap',
          {
            skipCheerio: true, // Skip cheerio, go straight to Browserless
            browserlessConfig: {
              endpoint: 'content', // Use /content for better JS rendering
              waitFor: { selector: 'h1, [data-testid="product-title"]', timeout: 15000 },
              timeout: 30000
            },
            customExtractor: (html, u) => extractGapFamilyData(html, u, 'Gap')
          }
        ), 35000)
      } else if (hostname.includes('nordstrom.com')) {
        productData = await scrapeWithTimeout(() => scrapeWithFallback(url, scrapeNordstrom, 'Nordstrom'))
      } else if (hostname.includes('stance.com')) {
        productData = await scrapeWithTimeout(() => scrapeWithFallback(url, scrapeStance, 'Stance'))
      } else if (hostname.includes('bathandbodyworks.com')) {
        // Bath & Body Works - definitely needs Browserless
        productData = await scrapeWithTimeout(() => scrapeWithFallback(url, scrapeGeneric, 'Bath & Body Works'), 20000)
      } else {
        productData = await scrapeWithTimeout(() => scrapeWithFallback(url, scrapeGeneric, 'Generic'))
      }
    } catch (timeoutError) {
      const errorMessage = timeoutError instanceof Error ? timeoutError.message : 'Request timeout'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 408 }
      )
    }

    // ========== GEMINI AI FALLBACK (Tier 5: 10/10 Resilience) ==========
    // If scraping failed or returned partial data, try Gemini AI as last resort
    if (productData && !productData.success && isGeminiAvailable()) {
      console.log(`🤖 Attempting Gemini AI fallback for ${hostname}...`)

      // Only use Gemini if we have HTML but selectors failed
      // (Don't waste tokens on network errors)
      const isParseError = productData.error?.includes('extract') ||
                           productData.error?.includes('selector') ||
                           productData.error?.includes('validation') ||
                           productData.error?.includes('incomplete')

      if (isParseError) {
        try {
          // Use raw HTML from scraper if available (prevents re-fetching and anti-bot issues)
          let html = productData.rawHtml

          // If no raw HTML stored, try fetching (fallback for simple sites)
          if (!html) {
            console.log(`🤖 No raw HTML cached, attempting fetch...`)
            const htmlResponse = await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            })

            if (htmlResponse.ok) {
              html = await htmlResponse.text()
            }
          }

          if (html) {
            const geminiData = await extractWithGemini(html, url, hostname)

            if (geminiData.success) {
              console.log(`✅ Gemini AI fallback succeeded!`)
              // Merge Gemini data with original attempt
              productData = {
                brand: geminiData.brand || productData.brand,
                model: geminiData.model || geminiData.title || productData.model,
                retailPrice: geminiData.retailPrice || productData.retailPrice,
                salePrice: geminiData.salePrice || productData.salePrice,
                images: geminiData.imageUrl ? [geminiData.imageUrl] : productData.images,
                category: productData.category || 'accessories',
                success: true,
                error: 'Data extracted via Gemini AI fallback (CSS selectors failed)'
              }
            } else {
              console.warn(`⚠️ Gemini AI fallback also failed:`, geminiData.error)
            }
          }
        } catch (geminiError) {
          console.error(`❌ Gemini AI fallback error:`, geminiError)
          // Continue with original productData (don't make things worse)
        }
      }
    }

    // Remove raw HTML before sending response (save bandwidth)
    const { rawHtml, ...responseData } = productData
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Scraping error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape product data'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

async function scrapeSoleRetriever(url: string): Promise<ProductData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const rawTitle = cleanText($('h1').text())
    const brand = rawTitle.split(' ')[0] || ''
    const model = rawTitle.replace(brand, '').trim()

    // Extract data from Release Details section
    let colorway = 'Standard'
    let sku = ''
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Find all detail rows in the Release Details section
    $('.space-y-2.p-4 .flex.justify-between').each((_, row) => {
      const label = cleanText($(row).find('.text-black\\/70, .dark\\:text-white').first().text()).toLowerCase()
      const value = cleanText($(row).find('.font-medium').last().text())

      if (label.includes('sku') || label.includes('style code')) {
        sku = value
      } else if (label.includes('colorway') || label.includes('color')) {
        colorway = value || 'Standard'
      } else if (label.includes('retail') || label.includes('price')) {
        const priceValue = extractPrice(value)
        if (priceValue) {
          if (label.includes('sale') || label.includes('discounted')) {
            salePrice = priceValue
          } else {
            retailPrice = priceValue
          }
        }
      }
    })

    // If we found a sale price but no retail, use the first price as retail
    if (!retailPrice && salePrice) {
      retailPrice = salePrice
      salePrice = undefined
    }

    // Image extraction - limit to 5
    const images: string[] = []
    $('img[src*="product"], .product-image img, [class*="product-image"] img').each((_, el) => {
      if (images.length >= 5) return false // Stop after 5 images
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `https://soleretriever.com${src}`)
      }
    })

    // Detect category
    const category = detectCategory(url, rawTitle, '')

    const productData: ProductData = {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, 'SoleRetriever')
    if (!validation.isValid) {
      console.warn('SoleRetriever scraping validation issues:', validation.issues)
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      }
    }

    return productData
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: `SoleRetriever scraping failed: ${errorMessage}`
    }
  }
}

async function scrapeNike(url: string): Promise<ProductData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const brand = 'Nike'

    // Extract model - enhanced with meta tags
    const model = cleanText(
      $('h1[data-qa="product-title"]').text() ||
      $('#pdp_product_title').text() ||
      $('h1#pdp_product_title').text() ||
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('.product-title').text()
    )

    // Extract colorway - enhanced selectors
    const colorway = cleanText(
      $('[data-qa="product-subtitle"]').text() ||
      $('.product-subtitle').text() ||
      $('[class*="subtitle"]').first().text() ||
      $('[class*="colorway"]').text() ||
      $('meta[property="product:color"]').attr('content') ||
      ''
    )

    // SKU extraction - Nike uses style code, enhanced selectors
    const sku = cleanText(
      $('[data-qa="product-style"]').text() ||
      $('.product-style').text() ||
      $('[class*="style-color"]').text() ||
      $('[class*="style"]').text() ||
      $('[class*="product-code"]').text() ||
      $('[class*="sku"]').text() ||
      $('meta[property="product:retailer_item_id"]').attr('content') ||
      ''
    )

    // Price extraction - enhanced with JSON-LD and meta tags
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Try JSON-LD structured data first
    const jsonLdScript = $('script[type="application/ld+json"]').html()
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript)
        if (jsonLd.offers) {
          const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers
          retailPrice = parseFloat(offers.price || offers.highPrice)
          salePrice = offers.lowPrice ? parseFloat(offers.lowPrice) : undefined
        }
      } catch (e) {
        // JSON-LD parsing failed, continue with HTML scraping
      }
    }

    // Fallback to HTML selectors
    if (!retailPrice && !salePrice) {
      const salePriceText = cleanText(
        $('[class*="sale"]').first().text() ||
        $('[class*="discount"]').first().text() ||
        $('.sale-price').first().text()
      )
      if (salePriceText) {
        salePrice = extractPrice(salePriceText)
      }

      const retailPriceText = cleanText(
        $('[data-qa="product-price"]').text() ||
        $('.product-price').text() ||
        $('[class*="currentPrice"]').first().text() ||
        $('[class*="price"]').first().text() ||
        $('meta[property="product:price:amount"]').attr('content')
      )
      retailPrice = extractPrice(retailPriceText)
    }

    if (!retailPrice && salePrice) {
      retailPrice = salePrice
      salePrice = undefined
    }

    // Image extraction - check ImageCarousel first
    const images: string[] = []

    // Try Nike ImageCarousel hero images first (higher quality)
    $('[data-testid="ImageCarousel"] img[data-testid="HeroImg"]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('logo') && !src.includes('icon') && !images.includes(src)) {
        const fullUrl = src.startsWith('http') ? src : `https://static.nike.com${src}`
        images.push(fullUrl)
      }
    })

    // Fallback to thumbnail images if no hero images found
    if (images.length === 0) {
      $('[data-testid="ImageCarousel"] img[data-testid^="Thumbnail-Img-"]').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src')
        if (src && !src.includes('logo') && !src.includes('icon') && !images.includes(src)) {
          const fullUrl = src.startsWith('http') ? src : `https://static.nike.com${src}`
          images.push(fullUrl)
        }
      })
    }

    // Fallback to meta tags if no carousel images
    if (images.length === 0) {
      const ogImage = $('meta[property="og:image"]').attr('content')
      if (ogImage) {
        images.push(ogImage.startsWith('http') ? ogImage : `https://static.nike.com${ogImage}`)
      }
    }

    // Final fallback to other Nike selectors
    if (images.length === 0) {
      $('img[src*="static.nike.com"], img[src*="secure-images.nike.com"], .product-image img, [class*="product-image"] img, picture img').each((_, el) => {
        if (images.length >= 5) return false
        const src = $(el).attr('src') || $(el).attr('data-src')
        if (src && !src.includes('logo') && !src.includes('icon') && !images.includes(src)) {
          const fullUrl = src.startsWith('http') ? src : `https://static.nike.com${src}`
          images.push(fullUrl)
        }
      })
    }

    // Detect category (Nike sells shoes, apparel, accessories)
    const category = detectCategory(url, model, '')

    const productData: ProductData = {
      brand,
      model: model || undefined,
      colorway: colorway || undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, 'Nike')
    if (!validation.isValid) {
      console.warn('Nike scraping validation issues:', validation.issues)
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      } else {
        return {
          success: false,
          error: `Nike scraping incomplete: ${validation.issues.join(', ')}. This may be a dynamic site requiring browser automation.`
        }
      }
    }

    return productData
  } catch (error) {
    return {
      success: false,
      error: `Nike scraping failed: ${error instanceof Error ? error.message : "Unknown error"}. This site may require browser automation for dynamic content.`
    }
  }
}

// Adidas scraper removed - site has strong bot protection
// Users are directed to use alternative sources (SoleRetriever, ShoePalace)
// or manual entry when Adidas URLs are detected

async function scrapeStockX(url: string): Promise<ProductData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // StockX typically has brand in the title
    const fullTitle = cleanText($('h1').text() || $('.product-name').text())
    const brand = fullTitle.split(' ')[0] || ''
    const model = fullTitle.replace(brand, '').trim()

    const colorway = cleanText($('.product-details .colorway').text() ||
                     $('[class*="colorway"]').text() ||
                     'Standard')

    // SKU extraction
    const sku = cleanText($('[class*="sku"]').text() ||
                $('[class*="style"]').text() ||
                $('[class*="product-code"]').text() ||
                '')

    // Price extraction - look for sale and retail prices
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Try to find sale price
    const salePriceText = cleanText($('[class*="sale"], [class*="discount"]').first().text())
    if (salePriceText) {
      salePrice = extractPrice(salePriceText)
    }

    // Try to find retail/original price
    const retailPriceText = cleanText($('.product-price').text() ||
                      $('.bid-price').text() ||
                      $('.price').first().text())
    retailPrice = extractPrice(retailPriceText)

    // If we found a sale price but no retail, use the first price as retail
    if (!retailPrice && salePrice) {
      retailPrice = salePrice
      salePrice = undefined
    }

    // Image extraction - limit to 5
    const images: string[] = []
    $('.product-media img, .product-image img').each((_, el) => {
      if (images.length >= 5) return false // Stop after 5 images
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `https://stockx.com${src}`)
      }
    })

    // Detect category
    const category = detectCategory(url, fullTitle, '')

    const productData: ProductData = {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, 'StockX')
    if (!validation.isValid) {
      console.warn('StockX scraping validation issues:', validation.issues)
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      }
    }

    return productData
  } catch (error) {
    return {
      success: false,
      error: `StockX scraping failed: ${error instanceof Error ? error.message : "Unknown error"}. This site may require browser automation for dynamic content.`
    }
  }
}

async function scrapeShoePalace(url: string): Promise<ProductData> {
  try {
    // Shopify stores have a .json endpoint
    // Convert URL to JSON endpoint
    let jsonUrl = url.split('?')[0] // Remove query params
    if (!jsonUrl.endsWith('.json')) {
      jsonUrl += '.json'
    }

    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const product = data.product

    if (!product) {
      throw new Error('No product data found')
    }

    // Extract title and parse brand/model
    const title = cleanText(product.title || '')
    let brand = ''
    let model = ''
    let colorway = 'Standard'

    if (title) {
      // First word is usually the brand
      const parts = title.split(' ')
      brand = parts[0] || ''

      // Check if there's a colorway in parentheses at the end of title
      const colorwayMatch = title.match(/\(([^)]+)\)\s*$/)
      if (colorwayMatch) {
        colorway = cleanText(colorwayMatch[1])
        // Remove the colorway from the model name
        model = title.replace(brand, '').replace(colorwayMatch[0], '').trim()
      } else {
        model = parts.slice(1).join(' ')
      }
    }

    // Extract SKU/Style code from product tags (e.g., "1203A537-300")
    // This is different from variant SKU which is internal inventory code
    let sku = ''

    if (product.tags) {
      const tags = Array.isArray(product.tags) ? product.tags : product.tags.split(', ')
      // Look for pattern like "1203A537-300" (letters/numbers with hyphen)
      const skuTag = tags.find((tag: string) => tag.match(/^[A-Z0-9]+-[A-Z0-9]+$/i))
      if (skuTag) {
        sku = skuTag
      }
    }

    // Fallback: check variant title for SKU pattern
    if (!sku && product.variants?.[0]) {
      const variantTitle = product.variants[0].title || ''
      const skuMatch = variantTitle.match(/([A-Z0-9]+-[A-Z0-9]+)/i)
      if (skuMatch) {
        sku = skuMatch[1]
      }
    }

    // Price extraction from first variant
    let retailPrice: number | undefined
    let salePrice: number | undefined

    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0]
      const price = parseFloat(variant.price)
      const compareAtPrice = variant.compare_at_price ? parseFloat(variant.compare_at_price) : 0

      if (compareAtPrice > 0 && compareAtPrice > price) {
        // On sale
        retailPrice = compareAtPrice
        salePrice = price
      } else {
        retailPrice = price
      }
    }

    // Extract images from Shopify product data
    const images: string[] = []
    if (product.images && Array.isArray(product.images)) {
      product.images.slice(0, 5).forEach((img: any) => {
        if (img.src) {
          // Ensure HTTPS
          const imgUrl = img.src.startsWith('http') ? img.src : `https:${img.src}`
          images.push(imgUrl)
        }
      })
    }

    // Detect category
    const category = detectCategory(url, title, '')

    const productData: ProductData = {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, 'Shoe Palace')
    if (!validation.isValid) {
      console.warn('Shoe Palace scraping validation issues:', validation.issues)
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      } else {
        return {
          success: false,
          error: `Shoe Palace scraping incomplete: ${validation.issues.join(', ')}`
        }
      }
    }

    console.log('🔍 Shoe Palace (Shopify) scraper found:', {
      title,
      brand,
      model,
      colorway,
      sku,
      retailPrice,
      salePrice,
      imageCount: images.length,
      category,
      validated: validation.isValid
    })

    return productData
  } catch (error) {
    return {
      success: false,
      error: `Shoe Palace scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
    }
  }
}

// Custom extractor for Gap family sites (Old Navy, Gap, Banana Republic)
// Optimized for their Next.js/React structure
function extractGapFamilyData(html: string, url: string, brandName: string): ProductData {
  try {
    const $ = cheerio.load(html)

    console.log(`🔍 Extracting Gap family data for ${brandName}...`)

    // Gap family uses specific data attributes and structure
    // Try multiple selector strategies

    // Strategy 1: Look for product title in multiple locations
    const title = cleanText(
      $('h1[data-testid="product-title"]').text() ||
      $('h1[itemprop="name"]').text() ||
      $('.product-title h1').text() ||
      $('h1.product-name').text() ||
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      ''
    )

    console.log(`📌 Title extracted: "${title}"`)

    if (!title || title.length < 3) {
      console.error(`❌ No valid title found for ${brandName}`)
      return {
        success: false,
        error: `Could not extract product title from ${brandName}. The page may not have loaded completely.`
      }
    }

    // Strategy 2: Extract breadcrumbs for better category detection
    const breadcrumbs = cleanText(
      $('[aria-label="breadcrumb"]').text() ||
      $('.breadcrumb').text() ||
      $('nav[role="navigation"] a').map((_, el) => $(el).text()).get().join(' ') ||
      ''
    )

    // Strategy 3: Extract prices from JSON-LD or meta tags first, then HTML
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Try JSON-LD structured data (most reliable)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonLd = JSON.parse($(el).html() || '{}')
        if (jsonLd.offers) {
          const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers
          if (offers.price) {
            retailPrice = parseFloat(offers.price)
          }
          if (offers.lowPrice && offers.highPrice) {
            salePrice = parseFloat(offers.lowPrice)
            retailPrice = parseFloat(offers.highPrice)
          }
        }
      } catch (e) {
        // Continue to next script tag
      }
    })

    // Fallback to meta tags
    if (!retailPrice) {
      const metaPrice = $('meta[property="product:price:amount"]').attr('content')
      if (metaPrice) {
        retailPrice = parseFloat(metaPrice)
      }
    }

    // Fallback to HTML selectors (less reliable for Gap family)
    if (!retailPrice && !salePrice) {
      const priceContainers = [
        '[data-testid="product-price"]',
        '.product-price',
        '[class*="price"]',
        '[class*="Price"]'
      ]

      for (const selector of priceContainers) {
        const priceText = cleanText($(selector).first().text())
        if (priceText) {
          const price = extractPrice(priceText)
          if (price) {
            if (!retailPrice) {
              retailPrice = price
            } else if (price < retailPrice) {
              salePrice = price
            }
          }
        }
      }
    }

    console.log(`💰 Prices: retail=$${retailPrice}, sale=$${salePrice}`)

    // Strategy 4: Extract images from multiple sources
    const images: string[] = []
    const hostname = new URL(url).hostname

    // Try meta tags first (highest quality)
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) {
      const fullUrl = ogImage.startsWith('http') ? ogImage : `https://${hostname}${ogImage}`
      images.push(fullUrl)
    }

    // Try preload images
    $('link[rel="preload"][as="image"]').each((_, el) => {
      if (images.length >= 5) return false
      const href = $(el).attr('href')
      if (href && !href.includes('logo') && !href.includes('icon')) {
        const fullUrl = href.startsWith('http') ? href : `https://${hostname}${href}`
        if (!images.includes(fullUrl)) {
          images.push(fullUrl)
        }
      }
    })

    // Try product images
    $('img[data-testid*="image"], img[class*="product"], picture img').each((_, el) => {
      if (images.length >= 5) return false
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('logo') && !src.includes('icon')) {
        const fullUrl = src.startsWith('http') ? src : `https://${hostname}${src}`
        if (!images.includes(fullUrl)) {
          images.push(fullUrl)
        }
      }
    })

    console.log(`🖼️ Found ${images.length} images`)

    // Strategy 5: Extract other metadata
    const colorway = cleanText(
      $('[data-testid="product-color"]').text() ||
      $('.color-name').text() ||
      $('meta[property="product:color"]').attr('content') ||
      ''
    )

    const sku = cleanText(
      $('[data-testid="style-number"]').text() ||
      $('.style-number').text() ||
      $('meta[property="product:retailer_item_id"]').attr('content') ||
      ''
    )

    // Detect category
    const category = detectCategory(url, title, breadcrumbs)

    const productData: ProductData = {
      brand: brandName,
      model: title,
      colorway: colorway || undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate
    const validation = validateProductData(productData, brandName)
    if (!validation.isValid) {
      console.warn(`⚠️ ${brandName} validation issues:`, validation.issues)
      if (productData.brand && productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      } else {
        return {
          success: false,
          error: `Failed to extract sufficient data from ${brandName}. Issues: ${validation.issues.join(', ')}`
        }
      }
    }

    console.log(`✅ ${brandName} extraction complete:`, {
      hasTitle: !!productData.model,
      hasPrice: !!productData.retailPrice,
      imageCount: productData.images?.length,
      category: productData.category
    })

    return productData

  } catch (error) {
    console.error(`❌ Error extracting ${brandName} data:`, error)
    return {
      success: false,
      error: `Failed to parse ${brandName} HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Unified scraper for Gap family brands (Gap, Old Navy, Banana Republic)
async function scrapeGapFamily(url: string, brandName: string): Promise<ProductData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract title - try multiple methods including meta tags
    const titleText = $('h1[data-testid="product-title"]').text() ||
                      $('h1.product-title').text() ||
                      $('h1').first().text() ||
                      $('meta[property="og:title"]').attr('content') ||
                      $('meta[name="twitter:title"]').attr('content') ||
                      ($('title').text() || '').split('|')[0]

    const title = cleanText(titleText)

    // Check if we got any meaningful HTML - if title is empty, page is likely JS-rendered
    if (!title) {
      return {
        success: false,
        error: `${brandName} page appears to be JavaScript-rendered with no static content. Browser automation (Browserless) is required for this site.`
      }
    }

    // Extract breadcrumbs for better category detection
    const breadcrumbs = cleanText(
      $('[aria-label="breadcrumb"]').text() ||
      $('.breadcrumb').text() ||
      $('nav[role="navigation"] a').map((_, el) => $(el).text()).get().join(' ')
    )

    // Use brand name or parse from title
    const brand = brandName
    const model = title

    // Detect category
    const category = detectCategory(url, title, breadcrumbs)

    // Extract SKU/Style number - enhanced with meta tags
    const sku = cleanText(
      $('[data-testid="style-number"]').text() ||
      $('.style-number').text() ||
      $('[class*="styleNumber"]').text() ||
      $('meta[name="product:retailer_item_id"]').attr('content') ||
      $('meta[property="product:retailer_item_id"]').attr('content') ||
      ''
    )

    // Extract colorway - enhanced selectors
    const colorway = cleanText(
      $('[data-testid="product-color"]').text() ||
      $('.product-color').text() ||
      $('.color-name').text() ||
      $('[class*="colorName"]').text() ||
      $('meta[property="product:color"]').attr('content') ||
      ''
    )

    // Extract prices - enhanced with meta tags and JSON-LD
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Try JSON-LD structured data first
    const jsonLdScript = $('script[type="application/ld+json"]').html()
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript)
        if (jsonLd.offers) {
          const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers
          retailPrice = parseFloat(offers.price || offers.highPrice)
          salePrice = offers.lowPrice ? parseFloat(offers.lowPrice) : undefined
        }
      } catch (e) {
        // JSON-LD parsing failed, continue with HTML scraping
      }
    }

    // Fallback to HTML selectors
    if (!retailPrice && !salePrice) {
      const salePriceText = cleanText(
        $('[data-testid="product-price-sale"]').text() ||
        $('.current-sale-price').first().text() ||
        $('.sale-price').first().text() ||
        $('[class*="salePrice"]').first().text()
      )
      if (salePriceText) {
        salePrice = extractPrice(salePriceText)
      }

      const regularPriceText = cleanText(
        $('[data-testid="product-price-regular"]').text() ||
        $('.regular-price-strike-through').first().text() ||
        $('.current-regular-price').first().text() ||
        $('.regular-price').first().text() ||
        $('[class*="regularPrice"]').first().text() ||
        $('meta[property="product:price:amount"]').attr('content')
      )
      if (regularPriceText) {
        retailPrice = extractPrice(regularPriceText)
      }
    }

    // If only sale price exists, use it as retail
    if (!retailPrice && salePrice) {
      retailPrice = salePrice
      salePrice = undefined
    }

    // Extract images - enhanced with meta tags
    const images: string[] = []
    const hostname = new URL(url).hostname

    // Try meta tags first (often have high-quality images)
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) {
      const fullUrl = ogImage.startsWith('http') ? ogImage : `https://${hostname}${ogImage}`
      images.push(fullUrl)
    }

    // Try preload links
    $('link[rel="preload"][as="image"]').each((_, el) => {
      if (images.length >= 5) return false
      const href = $(el).attr('href')
      if (href && !href.includes('logo') && !href.includes('icon')) {
        const fullUrl = href.startsWith('http') ? href : `https://${hostname}${href}`
        if (!images.includes(fullUrl)) {
          images.push(fullUrl)
        }
      }
    })

    // Fallback: product images
    if (images.length < 5) {
      $('img[src*="webcontent"], img[class*="product"], img[data-testid*="image"], picture img').each((_, el) => {
        if (images.length >= 5) return false
        const src = $(el).attr('src') || $(el).attr('data-src')
        if (src && !src.includes('logo') && !src.includes('icon') && !images.includes(src)) {
          const fullUrl = src.startsWith('http') ? src : `https://${hostname}${src}`
          images.push(fullUrl)
        }
      })
    }

    const productData: ProductData = {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway || undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, brandName)
    if (!validation.isValid) {
      console.warn(`${brandName} scraping validation issues:`, validation.issues)
      // Return with warning in error field but still mark as success if we got some data
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      } else {
        return {
          success: false,
          error: `${brandName} scraping incomplete: ${validation.issues.join(', ')}. This may be a dynamic site requiring browser automation.`
        }
      }
    }

    return productData
  } catch (error) {
    return {
      success: false,
      error: `${brandName} scraping failed: ${error instanceof Error ? error.message : "Unknown error"}. This site may require browser automation for dynamic content.`
    }
  }
}

async function scrapeNordstrom(url: string): Promise<ProductData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract product title
    const title = cleanText(
      $('h1[data-testid="product-title"]').text() ||
      $('h1.product-title').text() ||
      $('h1').first().text()
    )

    // Extract brand from title or meta tag
    const brand = cleanText(
      $('meta[property="product:brand"]').attr('content') ||
      $('[data-testid="brand-name"]').text() ||
      title.split(' ')[0]
    )

    const model = title.replace(brand, '').trim()

    // Extract breadcrumbs for category detection
    const breadcrumbs = cleanText($('[aria-label="breadcrumb"]').text() || $('.breadcrumb').text())

    // Detect category
    const category = detectCategory(url, title, breadcrumbs)

    // Extract colorway
    const colorway = cleanText(
      $('[data-testid="color-name"]').text() ||
      $('.color-name').text() ||
      $('meta[property="product:color"]').attr('content') ||
      ''
    )

    // Extract SKU
    const sku = cleanText(
      $('[data-testid="style-number"]').text() ||
      $('.style-number').text() ||
      $('meta[property="product:retailer_item_id"]').attr('content') ||
      ''
    )

    // Extract prices
    let retailPrice: number | undefined
    let salePrice: number | undefined

    const salePriceText = cleanText(
      $('[data-testid="sale-price"]').text() ||
      $('.sale-price').first().text()
    )
    if (salePriceText) {
      salePrice = extractPrice(salePriceText)
    }

    const regularPriceText = cleanText(
      $('[data-testid="regular-price"]').text() ||
      $('.regular-price').first().text() ||
      $('[class*="price"]').first().text()
    )
    if (regularPriceText) {
      retailPrice = extractPrice(regularPriceText)
    }

    if (!retailPrice && salePrice) {
      retailPrice = salePrice
      salePrice = undefined
    }

    // Extract images
    const images: string[] = []
    $('img[data-testid*="product-image"], img[class*="product"], picture img').each((_, el) => {
      if (images.length >= 5) return false
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('logo') && !images.includes(src)) {
        const fullUrl = src.startsWith('http') ? src : `https://nordstrom.com${src}`
        images.push(fullUrl)
      }
    })

    const productData: ProductData = {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway || undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, 'Nordstrom')
    if (!validation.isValid) {
      console.warn('Nordstrom scraping validation issues:', validation.issues)
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      }
    }

    return productData
  } catch (error) {
    return {
      success: false,
      error: `Nordstrom scraping failed: ${error instanceof Error ? error.message : "Unknown error"}. This site may require browser automation for dynamic content.`
    }
  }
}

async function scrapeStance(url: string): Promise<ProductData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const brand = 'Stance'

    // Extract product title - enhanced with meta tags
    const title = cleanText(
      $('h1.product-name').text() ||
      $('h1[data-testid="product-title"]').text() ||
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('.product-title').text()
    )

    const model = title

    // Extract breadcrumbs for category detection
    const breadcrumbs = cleanText(
      $('.breadcrumb').text() ||
      $('[aria-label="breadcrumb"]').text() ||
      $('nav[role="navigation"] a').map((_, el) => $(el).text()).get().join(' ')
    )

    // Detect category (Stance sells socks, underwear, apparel, accessories)
    const category = detectCategory(url, title, breadcrumbs)

    // Extract colorway - enhanced selectors
    const colorway = cleanText(
      $('.product-color').text() ||
      $('[data-color]').attr('data-color') ||
      $('.color-name').text() ||
      $('[class*="color"]').first().text() ||
      $('meta[property="product:color"]').attr('content') ||
      ''
    )

    // Extract SKU - enhanced selectors
    const sku = cleanText(
      $('.product-sku').text() ||
      $('[data-sku]').attr('data-sku') ||
      $('[class*="sku"]').text() ||
      $('meta[property="product:retailer_item_id"]').attr('content') ||
      ''
    )

    // Extract prices - enhanced with JSON-LD and meta tags
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Try JSON-LD structured data first
    const jsonLdScript = $('script[type="application/ld+json"]').html()
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript)
        if (jsonLd.offers) {
          const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers
          retailPrice = parseFloat(offers.price || offers.highPrice)
          salePrice = offers.lowPrice ? parseFloat(offers.lowPrice) : undefined
        }
      } catch (e) {
        // JSON-LD parsing failed, continue with HTML scraping
      }
    }

    // Fallback to HTML selectors
    if (!retailPrice && !salePrice) {
      const salePriceText = cleanText(
        $('.sale-price').first().text() ||
        $('[class*="salePrice"]').first().text() ||
        $('.price-sales').first().text()
      )
      if (salePriceText) {
        salePrice = extractPrice(salePriceText)
      }

      const regularPriceText = cleanText(
        $('.regular-price').first().text() ||
        $('.price').first().text() ||
        $('[class*="regularPrice"]').first().text() ||
        $('.price-standard').first().text() ||
        $('meta[property="product:price:amount"]').attr('content')
      )
      if (regularPriceText) {
        retailPrice = extractPrice(regularPriceText)
      }
    }

    if (!retailPrice && salePrice) {
      retailPrice = salePrice
      salePrice = undefined
    }

    // Extract images - enhanced with multiple fallbacks
    const images: string[] = []

    // Try meta tags first
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) {
      const fullUrl = ogImage.startsWith('http') ? ogImage : `https://stance.com${ogImage}`
      images.push(fullUrl)
    }

    // Try primary-images div (main product images)
    $('.primary-images img, .primary-images source, [class*="primaryImage"] img').each((_, el) => {
      if (images.length >= 5) return false

      // Try multiple image attributes (src, data-src, srcset, data-srcset)
      const src = $(el).attr('data-src') || $(el).attr('src')
      const srcset = $(el).attr('data-srcset') || $(el).attr('srcset')

      // If srcset exists, extract the highest quality image
      if (srcset) {
        const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0])
        const highestQualityUrl = srcsetUrls[srcsetUrls.length - 1]
        if (highestQualityUrl && !images.includes(highestQualityUrl)) {
          const fullUrl = highestQualityUrl.startsWith('http') ? highestQualityUrl : `https://stance.com${highestQualityUrl}`
          images.push(fullUrl)
        }
      } else if (src && !src.includes('logo') && !src.includes('icon') && !images.includes(src)) {
        const fullUrl = src.startsWith('http') ? src : `https://stance.com${src}`
        images.push(fullUrl)
      }
    })

    // Fallback: try other product image selectors
    if (images.length < 5) {
      $('img[class*="product"], .product-image img, picture img, [data-testid*="image"] img').each((_, el) => {
        if (images.length >= 5) return false
        const src = $(el).attr('data-src') || $(el).attr('src')
        if (src && !src.includes('logo') && !src.includes('icon') && !images.includes(src)) {
          const fullUrl = src.startsWith('http') ? src : `https://stance.com${src}`
          images.push(fullUrl)
        }
      })
    }

    const productData: ProductData = {
      brand,
      model: model || undefined,
      colorway: colorway || undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, 'Stance')
    if (!validation.isValid) {
      console.warn('Stance scraping validation issues:', validation.issues)
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      } else {
        return {
          success: false,
          error: `Stance scraping incomplete: ${validation.issues.join(', ')}. This may be a dynamic site requiring browser automation.`
        }
      }
    }

    return productData
  } catch (error) {
    return {
      success: false,
      error: `Stance scraping failed: ${error instanceof Error ? error.message : "Unknown error"}. This site may require browser automation for dynamic content.`
    }
  }
}

async function scrapeBEIS(url: string): Promise<ProductData> {
  try {
    // BEIS is a Shopify store - try .json endpoint first
    let jsonUrl = url.split('?')[0]
    if (!jsonUrl.endsWith('.json')) {
      jsonUrl += '.json'
    }

    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const product = data.product

    if (!product) {
      throw new Error('No product data found')
    }

    const brand = 'BEIS'
    const title = cleanText(product.title || '')
    const model = title

    // BEIS sells travel accessories (bags, luggage, etc.)
    const category = detectCategory(url, title, product.product_type || '')

    // Extract colorway from variant or title
    let colorway = ''
    if (product.variants?.[0]) {
      colorway = cleanText(product.variants[0].title || product.variants[0].option1 || '')
    }

    // SKU from variant
    const sku = product.variants?.[0]?.sku || ''

    // Extract prices
    let retailPrice: number | undefined
    let salePrice: number | undefined

    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0]
      const price = parseFloat(variant.price)
      const compareAtPrice = variant.compare_at_price ? parseFloat(variant.compare_at_price) : 0

      if (compareAtPrice > 0 && compareAtPrice > price) {
        retailPrice = compareAtPrice
        salePrice = price
      } else {
        retailPrice = price
      }
    }

    // Extract images
    const images: string[] = []
    if (product.images && Array.isArray(product.images)) {
      product.images.slice(0, 5).forEach((img: any) => {
        if (img.src) {
          const imgUrl = img.src.startsWith('http') ? img.src : `https:${img.src}`
          images.push(imgUrl)
        }
      })
    }

    const productData: ProductData = {
      brand,
      model: model || undefined,
      colorway: colorway || undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, 'BEIS')
    if (!validation.isValid) {
      console.warn('BEIS scraping validation issues:', validation.issues)
      if (productData.brand || productData.model) {
        productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
      }
    }

    return productData
  } catch (error) {
    return {
      success: false,
      error: `BEIS scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
    }
  }
}

async function scrapeGeneric(url: string): Promise<ProductData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Generic extraction attempts
    const title = cleanText($('h1').first().text() || $('[class*="title"]').first().text())
    const brand = title?.split(' ')[0] || ''
    const model = title?.replace(brand, '').trim()

    // SKU extraction
    const sku = cleanText($('[class*="sku"]').text() ||
                $('[class*="style"]').text() ||
                $('[class*="product-code"]').text() ||
                '')

    // Price extraction - look for sale and retail prices
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Try to find sale price
    const salePriceText = cleanText($('[class*="sale"], [class*="discount"]').first().text())
    if (salePriceText) {
      salePrice = extractPrice(salePriceText)
    }

    // Try to find retail/original price
    const retailPriceText = cleanText($('.price, [class*="price"]').first().text())
    retailPrice = extractPrice(retailPriceText)

    // If we found a sale price but no retail, use the first price as retail
    if (!retailPrice && salePrice) {
      retailPrice = salePrice
      salePrice = undefined
    }

    // Image extraction - limit to 5
    const images: string[] = []
    $('img[class*="product"], img[class*="main"]').each((_, el) => {
      if (images.length >= 5) return false // Stop after 5 images
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : new URL(src, url).href)
      }
    })

    // Detect category
    const category = detectCategory(url, title, '')

    const productData: ProductData = {
      brand: brand || undefined,
      model: model || undefined,
      colorway: undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    // Validate the scraped data
    const validation = validateProductData(productData, 'Generic')
    if (!validation.isValid) {
      console.warn('Generic scraping validation issues:', validation.issues)
      // For generic scraper, always return error if validation fails
      return {
        success: false,
        error: `Unable to extract product data from this site. Issues: ${validation.issues.join(', ')}. This site may require browser automation or a custom scraper.`
      }
    }

    return productData
  } catch (error) {
    return {
      success: false,
      error: `Generic scraping failed: ${error instanceof Error ? error.message : "Unknown error"}. This site may require browser automation or a custom scraper.`
    }
  }
}

function extractPrice(priceText: string): number | undefined {
  if (!priceText) return undefined

  const priceMatch = priceText.match(/[\d,]+\.?\d*/g)
  if (priceMatch) {
    const price = parseFloat(priceMatch[0].replace(/,/g, ''))
    return isNaN(price) ? undefined : price
  }

  return undefined
}

// ========== NEW RETAILER SCRAPERS (Smart Hybrid Architecture) ==========

/**
 * GOAT Scraper - Sneaker marketplace with Akamai bot protection
 * Strategy: Use Browserless /unblock with residential proxies
 */
async function scrapeGOAT(url: string): Promise<ProductData> {
  console.log('🐐 GOAT: Using Browserless /unblock endpoint...')

  if (!isBrowserlessAvailable()) {
    return {
      success: false,
      error: 'GOAT requires Browserless with residential proxies. Add BROWSERLESS_API_KEY to .env.local'
    }
  }

  try {
    // Use /unblock endpoint with residential proxy
    const browserResult = await fetchWithBrowserCached(url, {
      endpoint: 'unblock', // Residential proxy for Akamai bypass
      timeout: 35000,
      waitFor: {
        selector: 'h1, [class*="product"], [class*="title"]',
        timeout: 20000
      }
    })

    if (!browserResult.success || !browserResult.html) {
      return {
        success: false,
        error: `GOAT scraping failed: ${browserResult.error || 'Browserless returned no HTML'}`
      }
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(browserResult.html)

    // Extract product data using extractProductDataFromHtml helper
    const productData = extractProductDataFromHtml($, url, 'GOAT')

    // Include raw HTML for Gemini AI fallback (in case CSS selectors fail)
    productData.rawHtml = browserResult.html

    return productData

  } catch (error) {
    return {
      success: false,
      error: `GOAT scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Lululemon Scraper - Athletic apparel with Cloudflare bot protection
 * Strategy: Use Browserless /unblock with residential proxies
 */
async function scrapeLululemon(url: string): Promise<ProductData> {
  console.log('🧘 Lululemon: Using Browserless /unblock endpoint...')

  if (!isBrowserlessAvailable()) {
    return {
      success: false,
      error: 'Lululemon requires Browserless with residential proxies. Add BROWSERLESS_API_KEY to .env.local'
    }
  }

  try {
    // Use /unblock endpoint with residential proxy
    const browserResult = await fetchWithBrowserCached(url, {
      endpoint: 'unblock', // Residential proxy for Cloudflare bypass
      timeout: 35000,
      waitFor: {
        selector: 'h1, [data-lulu-price], [class*="price"]',
        timeout: 20000
      }
    })

    if (!browserResult.success || !browserResult.html) {
      return {
        success: false,
        error: `Lululemon scraping failed: ${browserResult.error || 'Browserless returned no HTML'}`
      }
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(browserResult.html)

    // Extract brand (always Lululemon)
    const brand = 'Lululemon'

    // Extract title
    const title = cleanText(
      $('h1').first().text() ||
      $('[data-testid="product-title"]').text() ||
      $('meta[property="og:title"]').attr('content') ||
      ''
    )

    // Extract prices
    let retailPrice: number | undefined
    let salePrice: number | undefined

    const priceText = cleanText(
      $('[data-lulu-price]').first().text() ||
      $('[class*="price"]').first().text() ||
      $('meta[property="og:price:amount"]').attr('content') ||
      ''
    )
    retailPrice = extractPrice(priceText)

    // Extract images
    const images: string[] = []
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) images.push(ogImage)

    $('img[src*="lululemon"], picture img').each((_, el) => {
      if (images.length >= 5) return false
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('logo') && !images.includes(src)) {
        const fullUrl = src.startsWith('http') ? src : `https://shop.lululemon.com${src}`
        images.push(fullUrl)
      }
    })

    // Detect category
    const category = detectCategory(url, title, '')

    const productData: ProductData = {
      brand,
      model: title || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    const validation = validateProductData(productData, 'Lululemon')
    if (!validation.isValid) {
      console.warn('⚠️ Lululemon validation issues:', validation.issues)
      productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
    }

    // Include raw HTML for Gemini AI fallback (in case CSS selectors fail)
    productData.rawHtml = browserResult.html

    return productData

  } catch (error) {
    return {
      success: false,
      error: `Lululemon scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Hollister Scraper - Abercrombie brand with updated domain (hollisterco.com)
 * Strategy: Use Browserless /content for React JS rendering
 */
async function scrapeHollister(url: string): Promise<ProductData> {
  console.log('👕 Hollister: Using Browserless /content endpoint...')

  if (!isBrowserlessAvailable()) {
    return {
      success: false,
      error: 'Hollister requires Browserless for JS rendering. Add BROWSERLESS_API_KEY to .env.local'
    }
  }

  try {
    // Use /content endpoint for JS rendering
    const browserResult = await fetchWithBrowserCached(url, {
      endpoint: 'content', // Standard JS rendering
      timeout: 30000,
      waitFor: {
        selector: 'h1, [data-test="product-price"]',
        timeout: 15000
      }
    })

    if (!browserResult.success || !browserResult.html) {
      return {
        success: false,
        error: `Hollister scraping failed: ${browserResult.error || 'Browserless returned no HTML'}`
      }
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(browserResult.html)

    // Extract product data using extractProductDataFromHtml helper
    const productData = extractProductDataFromHtml($, url, 'Hollister')

    // Include raw HTML for Gemini AI fallback (in case CSS selectors fail)
    productData.rawHtml = browserResult.html

    return productData

  } catch (error) {
    return {
      success: false,
      error: `Hollister scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Gymshark Scraper - Shopify store with blocked JSON endpoint
 * Strategy: Standard HTML scraping with Shopify-specific selectors
 * Note: Gymshark blocks the .json endpoint, so we can't use the Shopify backdoor
 */
async function scrapeGymshark(url: string): Promise<ProductData> {
  console.log('🦈 Gymshark: Using HTML scraping (JSON endpoint blocked)...')

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const brand = 'Gymshark'

    // Extract title from Shopify meta tags and h1
    const title = cleanText(
      $('h1.product-title').text() ||
      $('h1[data-testid="product-title"]').text() ||
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('.product-single__title').text()
    )

    // Extract prices using Shopify patterns
    let retailPrice: number | undefined
    let salePrice: number | undefined

    // Try JSON-LD first (most reliable for Shopify)
    const jsonLdScript = $('script[type="application/ld+json"]').html()
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript)
        if (jsonLd.offers) {
          const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers
          retailPrice = parseFloat(offers.price || offers.highPrice)
          salePrice = offers.lowPrice ? parseFloat(offers.lowPrice) : undefined
        }
      } catch (e) {
        // JSON-LD parsing failed, continue with HTML
      }
    }

    // Fallback to HTML selectors (Shopify patterns)
    if (!retailPrice) {
      const priceText = cleanText(
        $('.product-price__item').first().text() ||
        $('.price').first().text() ||
        $('[data-product-price]').first().text() ||
        $('meta[property="product:price:amount"]').attr('content') ||
        $('meta[property="og:price:amount"]').attr('content')
      )
      retailPrice = extractPrice(priceText)
    }

    // Extract images from Shopify
    const images: string[] = []

    // Try og:image first
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) images.push(ogImage)

    // Try Shopify product images
    $('.product-single__media img, .product__media img, [data-product-image]').each((_, el) => {
      if (images.length >= 5) return false
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('logo') && !images.includes(src)) {
        // Gymshark images are usually on CDN
        const fullUrl = src.startsWith('http') ? src : `https:${src}`
        images.push(fullUrl)
      }
    })

    // Detect category
    const category = detectCategory(url, title, '')

    const productData: ProductData = {
      brand,
      model: title || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true
    }

    const validation = validateProductData(productData, 'Gymshark')
    if (!validation.isValid) {
      console.warn('⚠️ Gymshark validation issues:', validation.issues)
      productData.error = `Partial data extracted. Issues: ${validation.issues.join(', ')}`
    }

    return productData

  } catch (error) {
    return {
      success: false,
      error: `Gymshark scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Helper function to validate scraped product data
function validateProductData(data: Partial<ProductData>, _siteName: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  // Check if we got at least a brand or model
  if (!data.brand && !data.model) {
    issues.push('Missing both brand and model name')
  }

  // Check if we got at least one price
  if (!data.retailPrice && !data.salePrice) {
    issues.push('No price information found')
  }

  // Validate price values are reasonable
  if (data.retailPrice && (data.retailPrice < 0 || data.retailPrice > 10000)) {
    issues.push(`Retail price seems invalid: $${data.retailPrice}`)
  }
  if (data.salePrice && (data.salePrice < 0 || data.salePrice > 10000)) {
    issues.push(`Sale price seems invalid: $${data.salePrice}`)
  }

  // Check if sale price is actually less than retail
  if (data.retailPrice && data.salePrice && data.salePrice >= data.retailPrice) {
    // Swap them - probably extracted in wrong order
    const temp = data.retailPrice
    data.retailPrice = data.salePrice
    data.salePrice = temp
  }

  // Check if we got at least one image
  if (!data.images || data.images.length === 0) {
    issues.push('No product images found')
  }

  // Validate image URLs
  if (data.images) {
    data.images = data.images.filter(img => {
      try {
        new URL(img)
        return true
      } catch {
        return false
      }
    })
  }

  return {
    isValid: issues.length === 0,
    issues
  }
}