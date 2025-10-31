import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Create test notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        notification_type: 'outfit_suggestion',
        title: 'Test Notification',
        message: 'This is a test notification. Your notification settings are working correctly!',
        severity: 'low',
        metadata: { test: true }
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error creating test notification:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
