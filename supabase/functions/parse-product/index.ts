import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParsedProduct {
  name: string
  brand: string
  model: string
  colorway?: string
  price: number
  salePrice?: number
  sku?: string
  images: string[]
  sizes: string[]
  inStock: boolean
  storeId: string
  url: string
}

interface StoreConfig {
  id: string
  name: string
  domain: string
  selectors: {
    name: string
    brand?: string
    price: string
    salePrice?: string
    sku?: string
    images: string
    sizes?: string
    inStock?: string
  }
  priceCleanup: (text: string) => number
  nameParser?: (name: string) => { brand: string; model: string; colorway?: string }
}

const storeConfigs: Record<string, StoreConfig> = {
  'snipesusa.com': {
    id: 'snipes-usa',
    name: 'Snipes USA',
    domain: 'snipesusa.com',
    selectors: {
      name: '.product-name h1, .pdp-product-name h1',
      price: '.price .current-price, .product-price .price-current',
      salePrice: '.price .sale-price, .product-price .price-sale',
      sku: '.product-id, [data-product-id]',
      images: '.product-images img, .pdp-images img',
      sizes: '.size-selector .size-option, .sizes .size',
      inStock: '.add-to-cart:not(:disabled), .buy-now:not(:disabled)'
    },
    priceCleanup: (text: string) => parseFloat(text.replace(/[$,]/g, '')),
    nameParser: (name: string) => {
      const parts = name.split(' - ')
      if (parts.length >= 2) {
        const brandModel = parts[0].trim()
        const colorway = parts[1].trim()
        const brandMatch = brandModel.match(/^(Nike|Air Jordan|Jordan|Adidas|New Balance|Puma|Vans|Converse)/i)
        const brand = brandMatch ? brandMatch[1] : 'Nike'
        const model = brandModel.replace(brand, '').trim()
        return { brand, model, colorway }
      }
      return { brand: 'Nike', model: name }
    }
  },
  'nike.com': {
    id: 'nike',
    name: 'Nike',
    domain: 'nike.com',
    selectors: {
      name: '[data-test="product-title"], .pdp_product_title h1',
      price: '.product-price .current-price, [data-test="product-price"]',
      salePrice: '.product-price .sale-price',
      sku: '.product-style, [data-test="product-sub-title"]',
      images: '.product-images img, [data-test="hero-image"] img',
      sizes: '.size-selector button, .size-chart button',
      inStock: '.add-to-cart:not(:disabled)'
    },
    priceCleanup: (text: string) => parseFloat(text.replace(/[$,]/g, '')),
    nameParser: (name: string) => ({
      brand: 'Nike',
      model: name.replace(/^Nike\s+/i, '').trim()
    })
  },
  'shoepalace.com': {
    id: 'shoe-palace',
    name: 'Shoe Palace',
    domain: 'shoepalace.com',
    selectors: {
      name: '.product-title h1, .product-name',
      price: '.price-current, .product-price .current',
      salePrice: '.price-sale, .product-price .sale',
      sku: '.product-sku, [data-sku]',
      images: '.product-gallery img, .product-images img',
      sizes: '.size-options .size, .sizes button',
      inStock: '.add-to-cart:not(:disabled)'
    },
    priceCleanup: (text: string) => parseFloat(text.replace(/[$,]/g, '')),
    nameParser: (name: string) => {
      const brandMatch = name.match(/^(Nike|Air Jordan|Jordan|Adidas|New Balance)/i)
      const brand = brandMatch ? brandMatch[1] : 'Nike'
      const model = name.replace(brand, '').trim()
      return { brand, model }
    }
  },
  'footlocker.com': {
    id: 'foot-locker',
    name: 'Foot Locker',
    domain: 'footlocker.com',
    selectors: {
      name: '.ProductName, .product-name h1',
      price: '.ProductPrice .sr-only, .price-current',
      salePrice: '.ProductPrice .sale, .price-sale',
      sku: '.ProductSku, .product-sku',
      images: '.ProductImages img, .product-images img',
      sizes: '.SizeChart button, .sizes .size',
      inStock: '.Button--primary:not(:disabled)'
    },
    priceCleanup: (text: string) => parseFloat(text.replace(/[$,]/g, '')),
    nameParser: (name: string) => {
      const parts = name.split(' - ')
      const mainName = parts[0]
      const colorway = parts[1]
      const brandMatch = mainName.match(/^(Nike|Air Jordan|Jordan|Adidas|New Balance)/i)
      const brand = brandMatch ? brandMatch[1] : 'Nike'
      const model = mainName.replace(brand, '').trim()
      return { brand, model, colorway }
    }
  },
  'hibbett.com': {
    id: 'hibbett',
    name: 'Hibbett Sports',
    domain: 'hibbett.com',
    selectors: {
      name: '.product-title, .pdp-product-title h1',
      price: '.price-current, .product-price .current',
      salePrice: '.price-sale, .product-price .sale',
      sku: '.product-id, .sku',
      images: '.product-images img, .gallery img',
      sizes: '.size-selector .size, .sizes button',
      inStock: '.add-to-bag:not(:disabled)'
    },
    priceCleanup: (text: string) => parseFloat(text.replace(/[$,]/g, '')),
    nameParser: (name: string) => {
      const brandMatch = name.match(/^(Nike|Air Jordan|Jordan|Adidas|New Balance)/i)
      const brand = brandMatch ? brandMatch[1] : 'Nike'
      const model = name.replace(brand, '').trim()
      return { brand, model }
    }
  }
}

function getStoreFromUrl(url: string): StoreConfig | null {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return storeConfigs[domain] || null
  } catch {
    return null
  }
}

async function fetchWithHeaders(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  })
}

function extractText($: cheerio.CheerioAPI, selector: string): string {
  return $(selector).first().text().trim()
}

function extractImages($: cheerio.CheerioAPI, selector: string, baseUrl: string): string[] {
  const images: string[] = []
  $(selector).each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (src) {
      try {
        const imageUrl = new URL(src, baseUrl).href
        if (!images.includes(imageUrl)) {
          images.push(imageUrl)
        }
      } catch {
        // Skip invalid URLs
      }
    }
  })
  return images.slice(0, 10) // Limit to 10 images
}

function extractSizes($: cheerio.CheerioAPI, selector: string): string[] {
  const sizes: string[] = []
  $(selector).each((_, el) => {
    const size = $(el).text().trim() || $(el).attr('data-size')
    if (size && size.match(/^\d+(\.\d+)?$/)) {
      sizes.push(size)
    }
  })
  return [...new Set(sizes)].sort()
}

async function parseProduct(url: string): Promise<ParsedProduct | null> {
  const store = getStoreFromUrl(url)
  if (!store) {
    throw new Error('Unsupported store domain')
  }

  const response = await fetchWithHeaders(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch product page: ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // Extract basic product data
  const name = extractText($, store.selectors.name)
  if (!name) {
    throw new Error('Product name not found')
  }

  const priceText = extractText($, store.selectors.price)
  const salePriceText = store.selectors.salePrice ? extractText($, store.selectors.salePrice) : ''

  const price = store.priceCleanup(priceText)
  const salePrice = salePriceText ? store.priceCleanup(salePriceText) : undefined

  if (!price || price <= 0) {
    throw new Error('Product price not found or invalid')
  }

  // Parse name into brand/model/colorway
  const nameInfo = store.nameParser ? store.nameParser(name) : { brand: 'Nike', model: name }

  // Extract additional data
  const sku = store.selectors.sku ? extractText($, store.selectors.sku) : undefined
  const images = extractImages($, store.selectors.images, url)
  const sizes = store.selectors.sizes ? extractSizes($, store.selectors.sizes) : []
  const inStock = store.selectors.inStock ? $(store.selectors.inStock).length > 0 : true

  return {
    name,
    brand: nameInfo.brand,
    model: nameInfo.model,
    colorway: nameInfo.colorway,
    price,
    salePrice,
    sku,
    images,
    sizes,
    inStock,
    storeId: store.id,
    url
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if store is supported
    const store = getStoreFromUrl(url)
    if (!store) {
      const supportedStores = Object.values(storeConfigs).map(s => s.domain)
      return new Response(
        JSON.stringify({
          error: 'Unsupported store',
          supportedStores
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the product
    const product = await parseProduct(url)

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse product data' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        product,
        store: {
          id: store.id,
          name: store.name,
          domain: store.domain
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Parse product error:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})