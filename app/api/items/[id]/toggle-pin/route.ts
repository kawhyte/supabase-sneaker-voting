import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/items/[id]/toggle-pin
 *
 * Toggle the is_pinned status of a wishlist item
 * - Max 5 pinned items per user
 * - Only wishlist items can be pinned
 * - RLS enforces user can only pin their own items
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: itemId } = await params

    // Get current item
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('id, is_pinned, status, user_id')
      .eq('id', itemId)
      .single()

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (item.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Only wishlist items can be pinned
    if (item.status !== 'wishlisted') {
      return NextResponse.json(
        { error: 'Only wishlist items can be pinned' },
        { status: 400 }
      )
    }

    const newPinnedStatus = !item.is_pinned

    // If pinning, check limit (max 5)
    if (newPinnedStatus) {
      const { count, error: countError } = await supabase
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_pinned', true)
        .eq('is_archived', false)

      if (countError) {
        console.error('Error checking pin count:', countError)
        return NextResponse.json(
          { error: 'Failed to check pin count' },
          { status: 500 }
        )
      }

      if (count !== null && count >= 5) {
        return NextResponse.json(
          { error: 'Maximum 5 pinned items allowed. Unpin another item first.' },
          { status: 400 }
        )
      }
    }

    // Toggle pin status
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({ is_pinned: newPinnedStatus })
      .eq('id', itemId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating pin status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update pin status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      is_pinned: newPinnedStatus,
      message: newPinnedStatus ? 'Item pinned to profile' : 'Item unpinned from profile'
    })

  } catch (error) {
    console.error('Error toggling pin status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
