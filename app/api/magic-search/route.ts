import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export interface MagicSearchResult {
	title: string
	price: number
	imageUrl: string
	brand: string
}

interface MagicSearchResponse {
	results: MagicSearchResult[]
	success: boolean
	error?: string
}

interface EbayItemSummary {
	title: string
	price: { value: string }
	image?: { imageUrl: string }
	brand?: string
}

/**
 * Attempts to infer brand from the title string.
 * Looks for known sneaker brand names at the start of or within the title.
 */
function extractBrand(title: string): string {
	const brands = [
		'Air Jordan',
		'Nike',
		'Adidas',
		'Jordan',
		'New Balance',
		'Asics',
		'Puma',
		'Reebok',
		'Converse',
		'Vans',
		'Brooks',
		'Saucony',
		'Hoka',
		'On Running',
		'Salomon',
		'Yeezy',
		'Under Armour',
		'Merrell',
		'Timberland',
		'Dior',
		'Balenciaga',
		'Gucci',
		'Louis Vuitton',
		'Off-White',
	]
	const titleLower = title.toLowerCase()
	for (const brand of brands) {
		const brandLower = brand.toLowerCase()
		if (
			titleLower.startsWith(brandLower) ||
			titleLower.includes(` ${brandLower} `) ||
			titleLower.includes(`(${brandLower})`)
		) {
			return brand
		}
	}
	return ''
}

async function getEbayAccessToken(): Promise<string> {
	const credentials = Buffer.from(
		`${process.env.EBAY_APP_ID}:${process.env.EBAY_CERT_ID}`
	).toString('base64')

	const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${credentials}`,
		},
		body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
	})

	if (!res.ok) throw new Error(`eBay OAuth failed: ${res.status}`)
	const data = await res.json()
	return data.access_token as string
}

export async function POST(
	request: NextRequest
): Promise<NextResponse<MagicSearchResponse>> {
	try {
		const body = await request.json()
		const { query } = body as { query: string }

		if (!query || typeof query !== 'string' || !query.trim()) {
			return NextResponse.json(
				{ success: false, results: [], error: 'Query is required' },
				{ status: 400 }
			)
		}

		const accessToken = await getEbayAccessToken()

		const searchUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query.trim() + ' sneakers')}&limit=6`

		const response = await fetch(searchUrl, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'X-EBAY-C-MARKETPLACE-ID': 'EBAY-US',
			},
		})

		if (!response.ok) {
			return NextResponse.json(
				{
					success: false,
					results: [],
					error: `eBay API request failed: ${response.status}`,
				},
				{ status: 502 }
			)
		}

		const data = await response.json()

		const results: MagicSearchResult[] = (
			(data.itemSummaries as EbayItemSummary[]) ?? []
		).map((item) => ({
			title: item.title,
			price: parseFloat(item.price.value),
			imageUrl: item.image?.imageUrl ?? '',
			brand: item.brand ?? extractBrand(item.title),
		}))

		return NextResponse.json({ success: true, results })
	} catch (error) {
		console.error('Magic search error:', error)
		return NextResponse.json(
			{ success: false, results: [], error: 'Search failed. Please try again.' },
			{ status: 500 }
		)
	}
}
