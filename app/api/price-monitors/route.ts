import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    // RLS automatically filters by authenticated user (user_id)
    const { data: monitors, error } = await supabase
      .from('price_monitors')
      .select(`
        *,
        items (
          brand,
          model,
          colorway
        )
      `)
      .order('created_at', { ascending: false })

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
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      product_url,
      store_name,
      target_price,
      item_id
    } = body

    // Validate required fields
    if (!product_url || !store_name || !item_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: product_url, store_name, item_id' },
        { status: 400 }
      )
    }

    // Note: Duplicate check removed - RLS + unique constraint (user_id, product_url) handles this
    // If duplicate exists, Postgres will return error with code 23505

    // Create new price monitor
    // RLS policy will enforce that user owns the item_id
    const { data: monitor, error: insertError } = await supabase
      .from('price_monitors')
      .insert({
        user_id: user.id,
        item_id,
        product_url,
        store_name,
        target_price: target_price || null,
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