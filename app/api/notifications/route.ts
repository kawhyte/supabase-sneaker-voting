/**
 * GET /api/notifications
 * Fetch user's notifications with cursor pagination
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const cursor = searchParams.get('cursor') // Timestamp for cursor pagination
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit + 1) // Fetch one extra to determine if there's a next page

    // Filter unread only
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    // Apply cursor pagination
    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    // Exclude snoozed notifications (application-side filtering since NOW() can't be in WHERE)
    const { data: allNotifications, error } = await query

    if (error) {
      console.error('Query error:', error)
      throw error
    }

    console.log(`Fetched ${allNotifications?.length || 0} notifications for user ${user.id}`)
    if (allNotifications && allNotifications.length > 0) {
      console.log('First notification:', allNotifications[0])
    }

    // Filter snoozed notifications
    const now = new Date()
    const notifications = (allNotifications || []).filter(notif => {
      if (!notif.snoozed_until) return true
      return new Date(notif.snoozed_until) < now
    })

    // Determine if there's a next page and get actual next cursor
    const hasMore = allNotifications && allNotifications.length > limit
    const displayNotifications = notifications.slice(0, limit)
    const nextCursor =
      hasMore && displayNotifications.length === limit
        ? displayNotifications[displayNotifications.length - 1]?.created_at
        : null

    return NextResponse.json({
      notifications: displayNotifications,
      nextCursor,
      hasMore: !!nextCursor
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
