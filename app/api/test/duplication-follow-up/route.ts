import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Test endpoint for duplication follow-up notifications
 * Creates a sample follow-up notification triggered after dismissing a duplication warning
 *
 * Usage: GET /api/test/duplication-follow-up
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

    // Get some owned items to use as "similar items"
    const { data: items, error: itemsError } = await supabase
      .from('sneakers')
      .select('id, brand, model, color, image_url')
      .eq('user_id', user.id)
      .eq('status', 'owned')
      .limit(3)

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'No owned items found for testing' },
        { status: 404 }
      )
    }

    const similarItems = items.map(item => ({
      brand: item.brand,
      model: item.model,
    }))

    // Create test notification (simulating a duplication follow-up)
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        notification_type: 'outfit_suggestion',
        title: '🤔 Can You Style This?',
        message: `You already own ${items.length} similar items. Try styling them in new ways before adding more!`,
        severity: 'low',
        link_url: '/dashboard?tab=outfits&action=create',
        action_label: 'Create Outfit',
        metadata: {
          trigger: 'duplication_warning_dismissed',
          item_name: 'Test Item',
          similar_items: similarItems,
        }
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error creating duplication follow-up notification:', notifError)
      return NextResponse.json(
        { error: 'Failed to create duplication follow-up notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Created duplication follow-up notification',
      notification,
      similarItemsCount: items.length,
      similarItems: similarItems,
      details: items.slice(0, 3).map(item => ({
        brand: item.brand,
        model: item.model,
        color: item.color,
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
