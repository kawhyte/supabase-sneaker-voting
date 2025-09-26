import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Return mock data for testing
    const mockProduct = {
      success: true,
      product: {
        name: 'Test Nike Air Force 1',
        brand: 'Nike',
        model: 'Air Force 1',
        colorway: 'White/Black',
        price: 110,
        salePrice: 99,
        sku: 'TEST-123',
        images: ['https://via.placeholder.com/400x400?text=Test+Image'],
        sizes: ['8', '9', '10', '11'],
        inStock: true,
        storeId: 'nike',
        url: url
      },
      store: {
        id: 'nike',
        name: 'Nike',
        domain: 'nike.com'
      }
    }

    return NextResponse.json(mockProduct)

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test API endpoint is working',
    timestamp: new Date().toISOString()
  })
}