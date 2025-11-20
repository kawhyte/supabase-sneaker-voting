import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/social/follow-status/[userId]
 *
 * Check if the current user is following a target user
 * - Returns follow status and follower counts
 * - Used for initial state in FollowButton component
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId: targetUserId } = await params

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      )
    }

    // Check if following
    const { data: followData } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_user_id', user.id)
      .eq('following_user_id', targetUserId)
      .maybeSingle()

    const isFollowing = !!followData

    // Get target user's follower/following counts
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('follower_count, following_count')
      .eq('user_id', targetUserId)
      .single()

    return NextResponse.json({
      isFollowing,
      followerCount: targetProfile?.follower_count ?? 0,
      followingCount: targetProfile?.following_count ?? 0,
    })

  } catch (error) {
    console.error('Error checking follow status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
