/**
 * GET /api/notifications-debug
 * Debug endpoint - Shows raw notification count for user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', user: null },
        { status: 401 }
      )
    }

    // Try to fetch notifications
    const { data, error, count } = await supabase
      .from('notifications')
      .select('id, title, is_read, created_at, user_id', { count: 'exact' })
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details,
        user_id: user.id,
        totalCount: 0,
        notifications: []
      })
    }

    return NextResponse.json({
      user_id: user.id,
      totalCount: count || 0,
      notifications: data || [],
      error: null
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    })
  }
}
