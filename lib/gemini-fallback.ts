/**
 * lib/gemini-fallback.ts
 *
 * Gemini AI Fallback Parser
 *
 * When CSS selectors fail but we successfully fetch HTML (200 OK),
 * use Google's Gemini Pro to extract product data from HTML.
 *
 * This is the "10/10 Resilience Layer" that adapts to layout changes.
 *
 * Usage:
 * 1. Add GEMINI_API_KEY to .env.local
 * 2. Get free key from: https://aistudio.google.com/app/apikey
 * 3. Free tier: 60 requests/minute
 *
 * Model: gemini-pro (stable, widely supported)
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

export interface GeminiProductData {
  brand?: string
  model?: string
  title?: string
  retailPrice?: number
  salePrice?: number
  imageUrl?: string
  success: boolean
  error?: string
  source: 'gemini-ai-fallback'
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY
}

/**
 * Strip HTML to keep only useful content for AI parsing
 * Removes scripts, styles, comments to reduce token usage
 */
function stripHtmlForAI(html: string): string {
  // Remove script tags and their content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove style tags and their content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ')

  // Limit to first 30,000 characters to stay under Gemini token limits
  // (Gemini 1.5 Flash supports up to 1M tokens, but we want to be conservative)
  if (cleaned.length > 30000) {
    cleaned = cleaned.substring(0, 30000)
  }

  return cleaned.trim()
}

/**
 * Extract product data using Gemini AI as fallback
 * Only call this when CSS selectors fail but HTML is successfully fetched
 *
 * @param html - The HTML content (will be stripped of scripts/styles)
 * @param url - The product URL (for context)
 * @param siteName - The retailer name (for logging)
 * @returns Extracted product data or error
 */
export async function extractWithGemini(
  html: string,
  url: string,
  siteName: string
): Promise<GeminiProductData> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY not configured. Add it to .env.local to enable AI fallback parsing.',
      source: 'gemini-ai-fallback'
    }
  }

  try {
    console.log(`🤖 Gemini AI: Attempting fallback extraction for ${siteName}...`)

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    // Use gemini-pro (stable model that works with all API versions)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    // Strip HTML to reduce tokens
    const cleanedHtml = stripHtmlForAI(html)
    console.log(`🤖 Gemini AI: Cleaned HTML to ${cleanedHtml.length} characters`)

    // Construct prompt
    const prompt = `You are a product data extractor. Extract the following information from this e-commerce product page HTML:

REQUIRED FIELDS:
- Product title/name
- Current price (the price the user would pay now)
- Original/retail price (if item is on sale, otherwise same as current price)

OPTIONAL FIELDS:
- Brand name
- Product image URL (the main product image)

INSTRUCTIONS:
1. Return ONLY a valid JSON object, no markdown formatting, no explanations
2. Use these exact field names: title, brand, currentPrice, originalPrice, imageUrl
3. For prices: extract ONLY the number (e.g., 49.99, not "$49.99" or "49.99 USD")
4. If a field is not found, use null
5. If currentPrice < originalPrice, the item is on sale
6. If you cannot find any price, return { "error": "No price found" }

URL: ${url}
Site: ${siteName}

HTML:
${cleanedHtml}

JSON Response:`

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log(`🤖 Gemini AI: Raw response: ${text.substring(0, 200)}...`)

    // Parse JSON response
    let parsed: any
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('🤖 Gemini AI: Failed to parse JSON response:', text)
      return {
        success: false,
        error: `Gemini returned invalid JSON: ${text.substring(0, 100)}`,
        source: 'gemini-ai-fallback'
      }
    }

    // Check for error in response
    if (parsed.error) {
      return {
        success: false,
        error: `Gemini AI could not extract data: ${parsed.error}`,
        source: 'gemini-ai-fallback'
      }
    }

    // Validate and transform response
    const productData: GeminiProductData = {
      title: parsed.title || parsed.name || undefined,
      brand: parsed.brand || undefined,
      model: parsed.title || parsed.name || undefined,
      retailPrice: parsed.originalPrice ? parseFloat(parsed.originalPrice) : undefined,
      salePrice: parsed.currentPrice ? parseFloat(parsed.currentPrice) : undefined,
      imageUrl: parsed.imageUrl || undefined,
      success: true,
      source: 'gemini-ai-fallback'
    }

    // If no retail price but has sale price, copy sale price to retail
    if (!productData.retailPrice && productData.salePrice) {
      productData.retailPrice = productData.salePrice
      productData.salePrice = undefined
    }

    // Validate we got at least title and price
    if (!productData.title || !productData.retailPrice) {
      console.warn('🤖 Gemini AI: Incomplete data extracted:', productData)
      return {
        ...productData,
        success: false,
        error: 'Gemini AI extracted incomplete data (missing title or price)'
      }
    }

    console.log(`✅ Gemini AI: Successfully extracted data:`, {
      title: productData.title?.substring(0, 50),
      retailPrice: productData.retailPrice,
      salePrice: productData.salePrice,
      brand: productData.brand
    })

    return productData

  } catch (error) {
    console.error('🤖 Gemini AI: Error:', error)
    return {
      success: false,
      error: `Gemini AI failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'gemini-ai-fallback'
    }
  }
}

/**
 * Get usage stats (helpful for monitoring API quota)
 */
export function getGeminiStats() {
  return {
    isConfigured: isGeminiAvailable(),
    model: 'gemini-pro',
    rateLimit: '60 requests/minute (free tier)',
    tokenLimit: '~30,000 characters per request (conservative)',
    pricing: 'Free tier available at https://aistudio.google.com'
  }
}
