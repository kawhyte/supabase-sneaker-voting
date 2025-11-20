import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/social/unfollow/[userId]
 *
 * Unfollow a user
 * - Removes follow relationship
 * - Follower/following counts updated automatically via triggers
 * - RLS policies ensure only the follower can unfollow
 */
export async function DELETE(
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

    // Check if follow relationship exists
    const { data: existingFollow } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_user_id', user.id)
      .eq('following_user_id', targetUserId)
      .maybeSingle()

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 400 }
      )
    }

    // Delete follow relationship
    // Note: Follower counts updated automatically by trigger
    const { error: unfollowError } = await supabase
      .from('followers')
      .delete()
      .eq('follower_user_id', user.id)
      .eq('following_user_id', targetUserId)

    if (unfollowError) {
      console.error('Error removing follow relationship:', unfollowError)
      return NextResponse.json(
        { error: 'Failed to unfollow user' },
        { status: 500 }
      )
    }

    // Fetch updated counts (triggers already ran)
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('follower_count, following_count')
      .eq('user_id', targetUserId)
      .single()

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followerCount: updatedProfile?.follower_count ?? 0,
      message: 'Successfully unfollowed user'
    })

  } catch (error) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
