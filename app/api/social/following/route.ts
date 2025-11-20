import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/social/following
 * Fetches paginated list of users that a user is following
 *
 * Query params:
 * - userId: Target user ID (required)
 * - limit: Number of results (default: 20, max: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const targetUserId = searchParams.get('userId')
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50)
    const offset = Number(searchParams.get('offset')) || 0

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      )
    }

    // Fetch following with profile data
    // Join with profiles to get user display info
    // Also check if current user is following each user
    const { data: following, error: followingError } = await supabase
      .from('followers')
      .select(`
        following_id,
        created_at,
        following_profile:profiles!followers_following_id_fkey (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('follower_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (followingError) {
      console.error('Error fetching following:', followingError)
      return NextResponse.json(
        { error: 'Failed to fetch following' },
        { status: 500 }
      )
    }

    // For each followed user, check if current user is following them
    const followingWithStatus = await Promise.all(
      (following || []).map(async (followed: any) => {
        const followedId = followed.following_id
        const profile = followed.following_profile

        // Check if current user is following this user
        const { data: followStatus } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', followedId)
          .maybeSingle()

        return {
          id: followedId,
          display_name: profile?.display_name || 'Anonymous User',
          avatar_url: profile?.avatar_url || null,
          is_following: !!followStatus,
          followed_at: followed.created_at,
          is_self: followedId === user.id,
        }
      })
    )

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetUserId)

    if (countError) {
      console.error('Error counting following:', countError)
    }

    return NextResponse.json({
      following: followingWithStatus,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Unexpected error in following API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
