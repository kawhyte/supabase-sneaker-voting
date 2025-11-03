import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Test endpoint for bundled wear reminders
 * Creates sample wear reminder notifications
 *
 * Usage: GET /api/test/wear-reminders
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

    // Get user's owned items
    const { data: items, error: itemsError } = await supabase
      .from('sneakers')
      .select('id, brand, model, color, image_url, last_worn_date')
      .eq('user_id', user.id)
      .eq('status', 'owned')
      .limit(5)

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'No owned items found for testing' },
        { status: 404 }
      )
    }

    // Create bundled wear reminder notification
    const now = new Date()
    const unwornItems = items.map(item => ({
      id: item.id,
      brand: item.brand,
      model: item.model,
      color: item.color,
      image_url: item.image_url,
      last_worn_date: item.last_worn_date,
      daysUnworn: item.last_worn_date
        ? Math.floor((now.getTime() - new Date(item.last_worn_date).getTime()) / (24 * 60 * 60 * 1000))
        : 999
    }))

    // Sort by days unworn
    unwornItems.sort((a, b) => b.daysUnworn - a.daysUnworn)

    // Create test notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        notification_type: 'wear_reminder',
        title: `${unwornItems.length} Items Need Love 💖`,
        message: `${unwornItems.length} items are feeling lonely. Give them some wardrobe time!`,
        severity: unwornItems[0]?.daysUnworn >= 90 ? 'high' : 'normal',
        link_url: '/dashboard?tab=owned&sort=unworn',
        action_label: 'View Items',
        is_bundled: true,
        bundled_count: unwornItems.length,
        bundled_items: unwornItems.slice(0, 3).map(item => ({
          itemId: item.id,
          itemName: `${item.brand} ${item.model}`,
          itemImage: item.image_url,
          daysUnworn: item.daysUnworn,
          color: item.color
        })),
        metadata: {
          bundled_items: unwornItems.map(item => ({
            id: item.id,
            brand: item.brand,
            model: item.model,
            color: item.color,
            days_unworn: item.daysUnworn
          })),
          max_days_unworn: unwornItems[0]?.daysUnworn || 0,
          item_count: unwornItems.length
        }
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error creating test notification:', notifError)
      return NextResponse.json(
        { error: 'Failed to create test notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Created bundled wear reminder with ${unwornItems.length} items`,
      notification,
      unwornItems: unwornItems.length,
      details: unwornItems.slice(0, 3).map(item => ({
        brand: item.brand,
        model: item.model,
        daysUnworn: item.daysUnworn
      }))
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
