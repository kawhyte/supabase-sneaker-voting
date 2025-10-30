/**
 * POST /api/notifications-direct
 * Create a notification directly (bypass service layer)
 * Used for testing purposes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        notification_type: body.notification_type,
        title: body.title,
        message: body.message,
        severity: body.severity || 'low',
        metadata: body.metadata || {},
        is_read: false,
        is_bundled: false,
        bundled_count: 0,
        snoozed_until: null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      id: data.id,
      message: 'Notification created successfully'
    })
  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
