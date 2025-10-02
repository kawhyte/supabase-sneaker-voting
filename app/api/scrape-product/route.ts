import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface ProductData {
  brand?: string
  model?: string
  colorway?: string
  sku?: string
  retailPrice?: number
  salePrice?: number
  images?: string[]
  success: boolean
  error?: string
}

// Helper function to clean text
function cleanText(text: string): string {
  return text
    .replace(/[\n\t\r]/g, ' ')  // Replace newlines and tabs with spaces
    .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
    .trim()                       // Remove leading/trailing whitespace
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
      if (hostname.includes('soleretriever.com')) {
        productData = await scrapeWithTimeout(() => scrapeSoleRetriever(url))
      } else if (hostname.includes('nike.com')) {
        productData = await scrapeWithTimeout(() => scrapeNike(url))
      } else if (hostname.includes('adidas.com')) {
        // Adidas has strong bot protection - skip scraping
        return NextResponse.json({
          success: false,
          error: 'Adidas auto-import is currently unavailable due to bot protection. Please enter product details manually or use an alternative source like SoleRetriever.com or ShoePalace.com'
        })
      } else if (hostname.includes('stockx.com')) {
        productData = await scrapeWithTimeout(() => scrapeStockX(url))
      } else if (hostname.includes('shoepalace.com')) {
        productData = await scrapeWithTimeout(() => scrapeShoePalace(url))
      } else {
        productData = await scrapeWithTimeout(() => scrapeGeneric(url))
      }
    } catch (timeoutError) {
      const errorMessage = timeoutError instanceof Error ? timeoutError.message : 'Request timeout'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 408 }
      )
    }

    return NextResponse.json(productData)

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

    // Try to extract colorway from title or subtitle
    const colorway = cleanText($('.product-subtitle').text() ||
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
    const salePriceText = cleanText($('.sale-price, [class*="sale-price"], [class*="discounted"]').first().text())
    if (salePriceText) {
      salePrice = extractPrice(salePriceText)
    }

    // Try to find retail/original price
    const retailPriceText = cleanText($('.original-price, [class*="original-price"], .price, [class*="price"]').first().text())
    retailPrice = extractPrice(retailPriceText)

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

    return {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const brand = 'Nike'
    const model = cleanText($('h1[data-qa="product-title"]').text() ||
                  $('#pdp_product_title').text() ||
                  $('h1').first().text())

    const colorway = cleanText($('[data-qa="product-subtitle"]').text() ||
                     $('.product-subtitle').text() ||
                     $('[class*="subtitle"]').text() ||
                     'Standard')

    // SKU extraction - Nike uses style code
    const sku = cleanText($('[class*="style"]').text() ||
                $('[class*="product-code"]').text() ||
                $('[class*="sku"]').text() ||
                '')

    // Price extraction - look for sale and retail prices
    let retailPrice: number | undefined
    let salePrice: number | undefined

    const salePriceText = cleanText($('[class*="sale"], [class*="discount"]').first().text())
    if (salePriceText) {
      salePrice = extractPrice(salePriceText)
    }

    const retailPriceText = cleanText($('[data-qa="product-price"]').text() ||
                      $('.product-price').text() ||
                      $('[class*="price"]').first().text())
    retailPrice = extractPrice(retailPriceText)

    if (!retailPrice && salePrice) {
      retailPrice = salePrice
      salePrice = undefined
    }

    // Image extraction - limit to 5
    const images: string[] = []
    $('img[src*="static.nike.com"], .product-image img, [class*="product-image"] img').each((_, el) => {
      if (images.length >= 5) return false
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `https://static.nike.com${src}`)
      }
    })

    return {
      brand,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `Nike scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
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

    return {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `StockX scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
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

    if (title) {
      // First word is usually the brand
      const parts = title.split(' ')
      brand = parts[0] || ''
      model = parts.slice(1).join(' ')
    }

    // Get SKU from first variant if available
    const sku = product.variants?.[0]?.sku || ''

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

    console.log('🔍 Shoe Palace (Shopify) scraper found:', {
      title,
      brand,
      model,
      sku,
      retailPrice,
      salePrice,
      imageCount: images.length,
      images
    })

    return {
      brand: brand || undefined,
      model: model || undefined,
      colorway: undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `Shoe Palace scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
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

    return {
      brand: brand || undefined,
      model: model || undefined,
      colorway: undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `Generic scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
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