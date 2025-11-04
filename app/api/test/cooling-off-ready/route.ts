import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Test endpoint for cooling-off ready notifications
 * Creates a sample cooling-off ready notification
 *
 * Usage: GET /api/test/cooling-off-ready
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get a wishlist item (cooling-off eligible)
    const { data: items, error: itemsError } = await supabase
      .from('sneakers')
      .select('id, brand, model, color, image_url, target_price, can_purchase_after')
      .eq('user_id', user.id)
      .eq('status', 'wishlisted')
      .not('can_purchase_after', 'is', null)
      .limit(1)

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'No wishlisted items with cooling-off period found for testing' },
        { status: 404 }
      )
    }

    const item = items[0]

    // Create test notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        notification_type: 'cooling_off_ready',
        title: '🔓 Ready to Purchase!',
        message: `Your cooling-off period for ${item.brand} ${item.model} is complete.${
          item.target_price ? ` Target: $${item.target_price}` : ''
        }`,
        severity: 'medium',
        link_url: `/dashboard?tab=wishlist&item=${item.id}`,
        action_label: 'View Item',
        metadata: {
          item_id: item.id,
          brand: item.brand,
          model: item.model,
          color: item.color,
          target_price: item.target_price,
          image_url: item.image_url,
        }
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error creating cooling-off notification:', notifError)
      return NextResponse.json(
        { error: 'Failed to create cooling-off notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Created cooling-off ready notification',
      notification,
      item: {
        id: item.id,
        brand: item.brand,
        model: item.model,
        color: item.color,
        target_price: item.target_price,
      }
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
