import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const user_name = searchParams.get('user_name')

  try {
    let query = supabase
      .from('price_monitors')
      .select(`
        *,
        sneakers (
          brand,
          model,
          colorway
        )
      `)
      .order('created_at', { ascending: false })

    if (user_name) {
      query = query.eq('user_name', user_name)
    }

    const { data: monitors, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      monitors: monitors || []
    })
  } catch (error) {
    console.error('Failed to fetch price monitors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price monitors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const {
      product_url,
      store_name,
      user_name,
      target_price,
      sneaker_id
    } = body

    // Validate required fields
    if (!product_url || !store_name || !user_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: product_url, store_name, user_name' },
        { status: 400 }
      )
    }

    // Check if monitor already exists for this URL and user
    const { data: existing, error: existingError } = await supabase
      .from('price_monitors')
      .select('id')
      .eq('product_url', product_url)
      .eq('user_name', user_name)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      throw new Error(existingError.message)
    }

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Price monitor already exists for this product and user' },
        { status: 409 }
      )
    }

    // Create new price monitor
    const { data: monitor, error: insertError } = await supabase
      .from('price_monitors')
      .insert({
        product_url,
        store_name,
        user_name,
        target_price: target_price || null,
        sneaker_id: sneaker_id || null,
        is_active: true,
        notification_sent: false
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(insertError.message)
    }

    // Try to get initial price
    try {
      const priceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/scrape-price`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: product_url })
        }
      )

      const priceData = await priceResponse.json()

      if (priceData.success && priceData.price) {
        // Update monitor with initial price
        await supabase
          .from('price_monitors')
          .update({
            last_price: priceData.price,
            last_checked_at: new Date().toISOString()
          })
          .eq('id', monitor.id)

        // Save initial price history
        await supabase
          .from('price_history')
          .insert({
            monitor_id: monitor.id,
            price: priceData.price,
            in_stock: priceData.inStock,
            checked_at: new Date().toISOString()
          })
      }
    } catch (priceError) {
      console.warn('Failed to get initial price:', priceError)
    }

    return NextResponse.json({
      success: true,
      monitor,
      message: 'Price monitor created successfully'
    })

  } catch (error) {
    console.error('Failed to create price monitor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create price monitor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { id, target_price, is_active, last_price, last_checked_at } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Monitor ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (target_price !== undefined) updateData.target_price = target_price
    if (is_active !== undefined) updateData.is_active = is_active
    if (last_price !== undefined) updateData.last_price = last_price
    if (last_checked_at !== undefined) updateData.last_checked_at = last_checked_at
    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString()
    }

    const { data: monitor, error } = await supabase
      .from('price_monitors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      monitor,
      message: 'Price monitor updated successfully'
    })

  } catch (error) {
    console.error('Failed to update price monitor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update price monitor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Monitor ID is required' },
      { status: 400 }
    )
  }

  try {
    // Delete associated price history first
    const { error: historyError } = await supabase
      .from('price_history')
      .delete()
      .eq('monitor_id', id)

    if (historyError) {
      console.warn('Failed to delete price history:', historyError)
    }

    // Delete the monitor
    const { error } = await supabase
      .from('price_monitors')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Price monitor deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete price monitor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete price monitor' },
      { status: 500 }
    )
  }
}