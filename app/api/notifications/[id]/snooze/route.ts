/**
 * PUT /api/notifications/:id/snooze
 * Snooze notification for X days
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { days = 3 } = await request.json()

    if (typeof days !== 'number' || days < 1) {
      return NextResponse.json(
        { error: 'Days must be a positive number' },
        { status: 400 }
      )
    }

    const snoozeUntil = new Date()
    snoozeUntil.setDate(snoozeUntil.getDate() + days)

    const { data, error } = await supabase
      .from('notifications')
      .update({
        snoozed_until: snoozeUntil.toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ notification: data })
  } catch (error: any) {
    console.error('Error snoozing notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
