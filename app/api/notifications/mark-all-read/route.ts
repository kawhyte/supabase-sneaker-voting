/**
 * POST /api/notifications/mark-all-read
 * Mark all user's notifications as read
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

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: now
      })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select('id')

    if (error) throw error

    return NextResponse.json({
      success: true,
      markedCount: data ? data.length : 0
    })
  } catch (error: any) {
    console.error('Error marking all as read:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
