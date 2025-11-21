import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/social/follow
 *
 * Follow a user (instant follow, no approval needed)
 * - Max 100 following limit enforced by database trigger
 * - Cannot follow yourself (enforced by CHECK constraint)
 * - Follower/following counts updated automatically via triggers
 * - RLS policies ensure only authenticated users can follow
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      )
    }

    // Prevent self-follow (also enforced by database constraint)
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Verify target user exists
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, follower_count')
      .eq('id', targetUserId)
      .single()

    if (profileError || !targetProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_user_id', user.id)
      .eq('following_user_id', targetUserId)
      .maybeSingle()

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      )
    }

    // Insert follow relationship
    // Note: 100 following limit enforced by database trigger
    // Note: Follower counts updated automatically by trigger
    const { error: followError } = await supabase
      .from('followers')
      .insert({
        follower_user_id: user.id,
        following_user_id: targetUserId
      })

    if (followError) {
      console.error('Error creating follow relationship:', followError)

      // Check if it's the following limit error
      if (followError.message?.includes('Following limit reached')) {
        return NextResponse.json(
          { error: 'Following limit reached (max 100). Unfollow someone first.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to follow user' },
        { status: 500 }
      )
    }

    // Fetch updated counts (triggers already ran)
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('follower_count, following_count')
      .eq('id', targetUserId)
      .single()

    return NextResponse.json({
      success: true,
      isFollowing: true,
      followerCount: updatedProfile?.follower_count ?? 0,
      message: 'Successfully followed user'
    })

  } catch (error) {
    console.error('Error following user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
