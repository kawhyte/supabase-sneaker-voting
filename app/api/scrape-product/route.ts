import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface ProductData {
  brand?: string
  model?: string
  colorway?: string
  retailPrice?: number
  images?: string[]
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
    let productData: ProductData

    if (hostname.includes('soleretriever.com')) {
      productData = await scrapeSoleRetriever(url)
    } else if (hostname.includes('nike.com')) {
      productData = await scrapeNike(url)
    } else if (hostname.includes('adidas.com')) {
      productData = await scrapeAdidas(url)
    } else if (hostname.includes('stockx.com')) {
      productData = await scrapeStockX(url)
    } else {
      productData = await scrapeGeneric(url)
    }

    return NextResponse.json(productData)

  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to scrape product data' },
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

    const brand = $('h1').text().split(' ')[0] || ''
    const fullTitle = $('h1').text() || ''
    const model = fullTitle.replace(brand, '').trim()

    // Try to extract colorway from title or subtitle
    const colorway = $('.product-subtitle').text() ||
                     $('[class*="colorway"]').text() ||
                     'Standard'

    // Price extraction
    const priceText = $('.price, [class*="price"]').first().text()
    const retailPrice = extractPrice(priceText)

    // Image extraction
    const images: string[] = []
    $('img[src*="product"], .product-image img, [class*="product-image"] img').each((_, el) => {
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `https://soleretriever.com${src}`)
      }
    })

    return {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      retailPrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `SoleRetriever scraping failed: ${error.message}`
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
    const model = $('h1[data-qa="product-title"]').text() ||
                  $('#pdp_product_title').text() ||
                  $('h1').first().text()

    const colorway = $('[data-qa="product-subtitle"]').text() ||
                     $('.product-subtitle').text() ||
                     $('[class*="subtitle"]').text() ||
                     'Standard'

    const priceText = $('[data-qa="product-price"]').text() ||
                      $('.product-price').text() ||
                      $('[class*="price"]').first().text()
    const retailPrice = extractPrice(priceText)

    const images: string[] = []
    $('img[src*="static.nike.com"], .product-image img, [class*="product-image"] img').each((_, el) => {
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `https://static.nike.com${src}`)
      }
    })

    return {
      brand,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      retailPrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `Nike scraping failed: ${error.message}`
    }
  }
}

async function scrapeAdidas(url: string): Promise<ProductData> {
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

    const brand = 'Adidas'
    const model = $('[data-qa="product-title"]').text() ||
                  $('.product-title').text() ||
                  $('h1').first().text()

    const colorway = $('.product-subtitle').text() ||
                     $('[data-qa="product-subtitle"]').text() ||
                     'Standard'

    const priceText = $('[data-qa="product-price"]').text() ||
                      $('.product-price').text() ||
                      $('.price').first().text()
    const retailPrice = extractPrice(priceText)

    const images: string[] = []
    $('img[src*="adidas"], .product-image img, [class*="product-image"] img').each((_, el) => {
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `https://assets.adidas.com${src}`)
      }
    })

    return {
      brand,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      retailPrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `Adidas scraping failed: ${error.message}`
    }
  }
}

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
    const fullTitle = $('h1').text() || $('.product-name').text()
    const brand = fullTitle.split(' ')[0] || ''
    const model = fullTitle.replace(brand, '').trim()

    const colorway = $('.product-details .colorway').text() ||
                     $('[class*="colorway"]').text() ||
                     'Standard'

    const priceText = $('.product-price').text() ||
                      $('.bid-price').text() ||
                      $('.price').first().text()
    const retailPrice = extractPrice(priceText)

    const images: string[] = []
    $('.product-media img, .product-image img').each((_, el) => {
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : `https://stockx.com${src}`)
      }
    })

    return {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway !== 'Standard' ? colorway : undefined,
      retailPrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `StockX scraping failed: ${error.message}`
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
    const title = $('h1').first().text() || $('[class*="title"]').first().text()
    const brand = title?.split(' ')[0] || ''
    const model = title?.replace(brand, '').trim()

    const priceText = $('.price, [class*="price"]').first().text()
    const retailPrice = extractPrice(priceText)

    const images: string[] = []
    $('img[class*="product"], img[class*="main"]').each((_, el) => {
      const src = $(el).attr('src')
      if (src && !images.includes(src)) {
        images.push(src.startsWith('http') ? src : new URL(src, url).href)
      }
    })

    return {
      brand: brand || undefined,
      model: model || undefined,
      colorway: undefined,
      retailPrice,
      images: images.length > 0 ? images : undefined,
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `Generic scraping failed: ${error.message}`
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