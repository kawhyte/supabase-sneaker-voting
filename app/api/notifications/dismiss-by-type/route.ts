import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { notification_type, ids } = await request.json()

    if (!notification_type || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: notification_type and ids array required' },
        { status: 400 }
      )
    }

    // Update notifications as read
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('notification_type', notification_type)
      .in('id', ids)
      .select()

    if (error) {
      console.error('Error dismissing notifications:', error)
      return NextResponse.json(
        { error: 'Failed to dismiss notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      dismissed: data?.length || 0,
      data
    })
  } catch (error) {
    console.error('Error in dismiss-by-type endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
