/**
 * GET /api/notifications-full-debug
 * Complete debug endpoint - mimics exactly what GET /api/notifications does
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const logs: string[] = []

  try {
    logs.push('1. Getting user...')
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logs.push(`✗ Auth error: ${authError?.message}`)
      return NextResponse.json({ error: 'Unauthorized', logs })
    }

    logs.push(`✓ User ID: ${user.id}`)

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    logs.push(`2. Query params: limit=${limit}, unreadOnly=${unreadOnly}, cursor=${cursor}`)

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    logs.push('3. Built base query')

    if (unreadOnly) {
      query = query.eq('is_read', false)
      logs.push('4. Added unreadOnly filter')
    }

    if (cursor) {
      query = query.lt('created_at', cursor)
      logs.push('5. Added cursor filter')
    }

    logs.push('6. Executing query...')
    const { data: allNotifications, error } = await query

    if (error) {
      logs.push(`✗ Query error: ${error.message}`)
      return NextResponse.json({ error: error.message, logs })
    }

    logs.push(
      `✓ Query returned ${allNotifications?.length || 0} notifications`
    )

    if (allNotifications && allNotifications.length > 0) {
      logs.push(`First notification: ${allNotifications[0].title}`)
      logs.push(
        `Sample: id=${allNotifications[0].id}, is_read=${allNotifications[0].is_read}, snoozed_until=${allNotifications[0].snoozed_until}`
      )
    }

    // Filter snoozed notifications
    const now = new Date()
    const notifications = (allNotifications || []).filter((notif) => {
      const isSnoozed = notif.snoozed_until && new Date(notif.snoozed_until) > now
      logs.push(
        `  Notification "${notif.title}": snoozed_until=${notif.snoozed_until}, isSnoozed=${isSnoozed}`
      )
      if (!notif.snoozed_until) return true
      return new Date(notif.snoozed_until) < now
    })

    logs.push(
      `7. After snooze filter: ${notifications.length} notifications`
    )

    // Determine if there's a next page
    const hasMore = allNotifications && allNotifications.length > limit
    const displayNotifications = notifications.slice(0, limit)
    const nextCursor =
      hasMore && displayNotifications.length === limit
        ? displayNotifications[displayNotifications.length - 1]?.created_at
        : null

    logs.push(
      `8. Final result: ${displayNotifications.length} to display, hasMore=${hasMore}`
    )

    return NextResponse.json({
      notifications: displayNotifications,
      nextCursor,
      hasMore: !!nextCursor,
      logs
    })
  } catch (error: any) {
    logs.push(`✗ Catch error: ${error.message}`)
    return NextResponse.json({ error: error.message, logs })
  }
}
