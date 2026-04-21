import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface TokenCache {
  token: string
  expiresAt: number
}

// Module-level token cache — survives across requests within the same serverless instance
let tokenCache: TokenCache | null = null

async function getEbayAccessToken(): Promise<string> {
  const now = Date.now()
  if (tokenCache && now < tokenCache.expiresAt - 60_000) {
    return tokenCache.token
  }

  // Support both naming conventions (EBAY_APP_ID is used by the existing magic-search route)
  const clientId = process.env.EBAY_APP_ID ?? process.env.EBAY_CLIENT_ID
  const clientSecret = process.env.EBAY_CERT_ID ?? process.env.EBAY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing eBay credentials: set EBAY_APP_ID and EBAY_CERT_ID in .env.local')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`eBay OAuth failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache = { token: data.access_token, expiresAt: now + data.expires_in * 1000 }
  return tokenCache.token
}

interface LocalizedAspect {
  name: string
  value: string[]
}

function extractBrand(title: string, aspects?: LocalizedAspect[]): string {
  if (aspects) {
    const match = aspects.find((a) => a.name.toLowerCase() === 'brand')
    if (match?.value?.[0]) return match.value[0]
  }
  const knownBrands = [
    'Air Jordan', 'Nike', 'Adidas', 'Jordan', 'New Balance', 'Asics', 'Puma',
    'Reebok', 'Converse', 'Vans', 'Brooks', 'Saucony', 'Hoka', 'On Running',
    'Salomon', 'Yeezy', 'Under Armour', 'Merrell', 'Timberland', 'Dior',
    'Balenciaga', 'Gucci', 'Louis Vuitton', 'Off-White',
  ]
  const lower = title.toLowerCase()
  for (const brand of knownBrands) {
    if (lower.startsWith(brand.toLowerCase()) || lower.includes(` ${brand.toLowerCase()} `)) {
      return brand
    }
  }
  return ''
}

function extractSku(epid?: string, title?: string, aspects?: LocalizedAspect[]): string {
  if (epid) return epid
  if (aspects) {
    const match = aspects.find((a) =>
      ['style code', 'style', 'mpn', 'sku'].includes(a.name.toLowerCase())
    )
    if (match?.value?.[0]) return match.value[0]
  }
  // Fallback: extract Nike/Adidas style codes from the title (e.g., CU8591-100, FZ5558)
  const code = title?.match(/\b([A-Z]{2,4}\d{4,6}[-/]?\d{0,3})\b/)
  return code?.[1] ?? ''
}

export interface SneakerSearchResult {
  title: string
  brand: string
  sku: string
  imageUrl: string
  price: string
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''

  if (query.length < 3) {
    return NextResponse.json({ results: [] })
  }

  try {
    const accessToken = await getEbayAccessToken()

    const ebayUrl = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search')
    ebayUrl.searchParams.set('q', query)
    ebayUrl.searchParams.set('category_ids', '15709') // Sneakers & Athletic Shoes
    ebayUrl.searchParams.set('limit', '5')

    const ebayRes = await fetch(ebayUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY-US',
        'Content-Type': 'application/json',
      },
    })

    if (!ebayRes.ok) {
      return NextResponse.json(
        { results: [], error: `eBay Browse API error: ${ebayRes.status}` },
        { status: 502 }
      )
    }

    const data = (await ebayRes.json()) as {
      itemSummaries?: Array<{
        title: string
        epid?: string
        localizedAspects?: LocalizedAspect[]
        image?: { imageUrl: string }
        price?: { value: string; currency: string }
      }>
    }

    const results: SneakerSearchResult[] = (data.itemSummaries ?? []).map((item) => ({
      title: item.title,
      brand: extractBrand(item.title, item.localizedAspects),
      sku: extractSku(item.epid, item.title, item.localizedAspects),
      imageUrl: item.image?.imageUrl ?? '',
      price: item.price
        ? `$${parseFloat(item.price.value).toFixed(2)}`
        : '',
    }))

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('[sneaker-search] Error:', error)
    return NextResponse.json(
      { results: [], error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}
