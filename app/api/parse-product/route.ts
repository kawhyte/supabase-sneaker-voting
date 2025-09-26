import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { productCache } from '@/lib/product-cache'

export async function POST(request: NextRequest) {
  try {
    console.log('API route called')
    const { url, forceRefresh = false } = await request.json()
    console.log('Received URL:', url)

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh && productCache.has(url)) {
      const cachedData = productCache.get(url)
      console.log('Returning cached data')
      return NextResponse.json({
        ...cachedData,
        fromCache: true
      })
    }

    // Create Supabase client
    const supabase = await createClient()
    console.log('Created Supabase client')

    // Call the Edge Function
    console.log('Calling Edge Function...')
    const { data, error } = await supabase.functions.invoke('parse-product', {
      body: { url }
    })

    console.log('Edge Function response:', { data, error })

    if (error) {
      console.error('Supabase function error:', error)
      return NextResponse.json(
        { error: `Edge Function error: ${error.message}` },
        { status: 500 }
      )
    }

    if (data?.error) {
      console.log('Data error:', data.error)
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      )
    }

    if (data?.success) {
      // Cache the successful result
      productCache.set(url, data)
      console.log('Cached successful result')

      return NextResponse.json({
        ...data,
        fromCache: false
      })
    } else {
      console.log('No success flag in data:', data)
      return NextResponse.json(
        { error: 'Failed to parse product data' },
        { status: 422 }
      )
    }

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// Get cache statistics
export async function GET() {
  try {
    const stats = productCache.getCacheStats()
    return NextResponse.json({
      cache: stats,
      success: true
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    )
  }
}

// Clear cache
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store')

    if (storeId) {
      productCache.clearByStore(storeId)
      return NextResponse.json({
        message: `Cleared cache for store: ${storeId}`,
        success: true
      })
    } else {
      productCache.clear()
      return NextResponse.json({
        message: 'Cache cleared successfully',
        success: true
      })
    }
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}