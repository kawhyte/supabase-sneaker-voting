import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/social/followers
 * Fetches paginated list of followers for a user
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

    // Fetch followers with profile data
    // Join with profiles to get user display info
    // Also check if current user is following each follower
    const { data: followers, error: followersError } = await supabase
      .from('followers')
      .select(`
        follower_id,
        created_at,
        follower_profile:profiles!followers_follower_id_fkey (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('following_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (followersError) {
      console.error('Error fetching followers:', followersError)
      return NextResponse.json(
        { error: 'Failed to fetch followers' },
        { status: 500 }
      )
    }

    // For each follower, check if current user is following them
    const followersWithStatus = await Promise.all(
      (followers || []).map(async (follower: any) => {
        const followerId = follower.follower_id
        const profile = follower.follower_profile

        // Check if current user is following this follower
        const { data: followStatus } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', followerId)
          .maybeSingle()

        return {
          id: followerId,
          display_name: profile?.display_name || 'Anonymous User',
          avatar_url: profile?.avatar_url || null,
          is_following: !!followStatus,
          followed_at: follower.created_at,
          is_self: followerId === user.id,
        }
      })
    )

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId)

    if (countError) {
      console.error('Error counting followers:', countError)
    }

    return NextResponse.json({
      followers: followersWithStatus,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Unexpected error in followers API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
