import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * POST /api/outfits/[id]/generate-preview
 *
 * Triggers preview generation for an outfit
 * Actual generation happens client-side via Canvas API
 * This endpoint updates the database status and returns success
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: outfitId } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify outfit belongs to user
    const { data: outfit, error: fetchError } = await supabase
      .from('outfits')
      .select('id, user_id')
      .eq('id', outfitId)
      .single()

    if (fetchError || !outfit) {
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 })
    }

    if (outfit.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mark as pending (client will generate)
    const { error: updateError } = await supabase
      .from('outfits')
      .update({ preview_status: 'pending' })
      .eq('id', outfitId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update preview status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
