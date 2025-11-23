/**
 * lib/shopify-json-fetcher.ts
 *
 * Shopify JSON Backdoor
 *
 * Shopify stores expose a .json API endpoint for every product page.
 * This is 100% reliable and requires no HTML parsing.
 *
 * Strategy: Append .json to the product URL and fetch structured data.
 *
 * Example:
 * HTML: https://www.gymshark.com/products/gymshark-twist-front-bralette-white-aw24
 * JSON: https://www.gymshark.com/products/gymshark-twist-front-bralette-white-aw24.json
 *
 * Benefits:
 * - No CSS selectors needed
 * - No bot detection (it's an official API)
 * - 100% reliable (Shopify structure is standardized)
 * - Faster than HTML scraping
 */

import { ItemCategory } from '@/components/types/item-category'

export interface ShopifyProductData {
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
  source: 'shopify-json'
}

/**
 * Detect category from product title, tags, and product type
 */
function detectCategoryFromShopify(
  title: string,
  productType: string = '',
  tags: string[] = []
): ItemCategory {
  const combined = `${title} ${productType} ${tags.join(' ')}`.toLowerCase()

  // Shoes
  if (
    combined.includes('shoe') ||
    combined.includes('sneaker') ||
    combined.includes('boot') ||
    combined.includes('sandal') ||
    combined.includes('slipper') ||
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
    combined.includes('bra') ||
    combined.includes('bralette') ||
    combined.includes('sports bra')
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
    combined.includes('jogger') ||
    combined.includes('sweatpant')
  ) {
    return 'bottoms'
  }

  // Outerwear
  if (
    combined.includes('jacket') ||
    combined.includes('coat') ||
    combined.includes('blazer') ||
    combined.includes('parka') ||
    combined.includes('windbreaker')
  ) {
    return 'outerwear'
  }

  // Accessories
  if (
    combined.includes('bag') ||
    combined.includes('backpack') ||
    combined.includes('hat') ||
    combined.includes('cap') ||
    combined.includes('accessory') ||
    combined.includes('belt') ||
    combined.includes('watch')
  ) {
    return 'accessories'
  }

  // Default to accessories
  return 'accessories'
}

/**
 * Fetch product data from Shopify JSON endpoint
 *
 * @param url - The product URL (will be converted to .json)
 * @returns Structured product data
 */
export async function fetchShopifyProduct(url: string): Promise<ShopifyProductData> {
  try {
    console.log(`🛍️ Shopify JSON: Fetching data for ${url}`)

    // Convert URL to JSON endpoint
    let jsonUrl = url.split('?')[0] // Remove query params
    if (!jsonUrl.endsWith('.json')) {
      jsonUrl += '.json'
    }

    console.log(`🛍️ Shopify JSON: Converted to ${jsonUrl}`)

    // Fetch JSON data
    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const product = data.product

    if (!product) {
      throw new Error('No product data found in JSON response')
    }

    console.log(`🛍️ Shopify JSON: Found product "${product.title}"`)

    // Extract data from JSON structure
    const title = product.title || ''
    const vendor = product.vendor || '' // Shopify calls brand "vendor"
    const productType = product.product_type || ''
    const tags = Array.isArray(product.tags) ? product.tags : (product.tags || '').split(', ')

    // Extract brand and model
    // Strategy: Vendor is usually the brand, title is the model name
    const brand = vendor || title.split(' ')[0]
    const model = title

    // Extract colorway from variant or tags
    let colorway = ''
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0]
      // Check option1, option2, option3 for color
      colorway = variant.option1 || variant.option2 || variant.option3 || ''

      // If color is in title format like "Twist Front Bralette - White"
      if (!colorway && variant.title && variant.title !== 'Default Title') {
        colorway = variant.title
      }
    }

    // Extract SKU
    const sku = product.variants?.[0]?.sku || ''

    // Extract prices from first variant
    let retailPrice: number | undefined
    let salePrice: number | undefined

    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0]
      const price = parseFloat(variant.price)
      const compareAtPrice = variant.compare_at_price ? parseFloat(variant.compare_at_price) : 0

      if (compareAtPrice > 0 && compareAtPrice > price) {
        // Item is on sale
        retailPrice = compareAtPrice
        salePrice = price
      } else {
        retailPrice = price
      }
    }

    // Extract images (up to 5)
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
    const category = detectCategoryFromShopify(title, productType, tags)

    // Construct response
    const productData: ShopifyProductData = {
      brand: brand || undefined,
      model: model || undefined,
      colorway: colorway || undefined,
      sku: sku || undefined,
      retailPrice,
      salePrice,
      images: images.length > 0 ? images : undefined,
      category,
      success: true,
      source: 'shopify-json'
    }

    console.log(`✅ Shopify JSON: Successfully extracted:`, {
      brand: productData.brand,
      model: productData.model?.substring(0, 50),
      retailPrice: productData.retailPrice,
      salePrice: productData.salePrice,
      imageCount: productData.images?.length,
      category: productData.category
    })

    return productData

  } catch (error) {
    console.error('🛍️ Shopify JSON: Error:', error)
    return {
      success: false,
      error: `Shopify JSON fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'shopify-json'
    }
  }
}

/**
 * Check if URL is likely a Shopify store
 * Can be used before attempting JSON fetch
 */
export function isShopifyUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()

    // Direct Shopify hosted stores
    if (hostname.includes('myshopify.com')) {
      return true
    }

    // Common patterns for Shopify stores with custom domains
    const shopifyPatterns = [
      '/products/', // Shopify product URLs always have /products/
      '/collections/' // Shopify collection URLs
    ]

    return shopifyPatterns.some(pattern => url.includes(pattern))
  } catch {
    return false
  }
}
