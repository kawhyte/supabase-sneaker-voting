import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Test endpoint for cost-per-wear milestone notifications
 * Creates a sample cost-per-wear milestone notification
 *
 * Usage: GET /api/test/cost-per-wear-milestone
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

    // Get an owned item with wear data
    const { data: items, error: itemsError } = await supabase
      .from('sneakers')
      .select('id, brand, model, color, image_url, wears, purchase_price, retail_price')
      .eq('user_id', user.id)
      .eq('status', 'owned')
      .gt('wears', 0)
      .limit(1)

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'No owned items with wear data found for testing' },
        { status: 404 }
      )
    }

    const item = items[0]
    const purchasePrice = item.purchase_price || item.retail_price || 100
    const costPerWear = purchasePrice / (item.wears || 1)

    // Determine target based on price tier
    let targetCostPerWear = 10
    if (purchasePrice < 50) targetCostPerWear = 2
    else if (purchasePrice < 150) targetCostPerWear = 5

    // Create test notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        notification_type: 'cost_per_wear_milestone',
        title: '🎉 Cost-Per-Wear Goal Achieved!',
        message: `Your ${item.brand} ${item.model} is earning its keep! Now at $${costPerWear.toFixed(
          2
        )}/wear (${item.wears} wears).`,
        severity: 'low',
        link_url: `/dashboard?tab=owned&item=${item.id}`,
        action_label: 'View Progress',
        metadata: {
          item_id: item.id,
          brand: item.brand,
          model: item.model,
          color: item.color,
          wears: item.wears,
          purchase_price: purchasePrice,
          cost_per_wear: costPerWear,
          target_cost_per_wear: targetCostPerWear,
          milestone_type: 'target_achieved',
          image_url: item.image_url,
        }
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error creating cost-per-wear notification:', notifError)
      return NextResponse.json(
        { error: 'Failed to create cost-per-wear notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Created cost-per-wear milestone notification',
      notification,
      item: {
        id: item.id,
        brand: item.brand,
        model: item.model,
        color: item.color,
        wears: item.wears,
        purchase_price: purchasePrice,
        cost_per_wear: costPerWear,
        target_cost_per_wear: targetCostPerWear,
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
