import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  id: string
}

/**
 * DELETE /api/outfits/:id
 * Archive or delete an outfit
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params
  try {
    const supabase = await createClient()

    // Get user session
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

    const outfitId = params.id

    if (!outfitId) {
      return NextResponse.json(
        { error: 'Outfit ID required' },
        { status: 400 }
      )
    }

    // Verify outfit belongs to user
    const { data: outfit, error: fetchError } = await supabase
      .from('outfits')
      .select('id, user_id')
      .eq('id', outfitId)
      .single()

    if (fetchError || !outfit) {
      return NextResponse.json(
        { error: 'Outfit not found' },
        { status: 404 }
      )
    }

    if (outfit.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Archive the outfit (soft delete)
    const { error: deleteError } = await supabase
      .from('outfits')
      .update({ is_archived: true })
      .eq('id', outfitId)

    if (deleteError) {
      console.error('Failed to delete outfit:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete outfit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Outfit delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/outfits/:id
 * Fetch a specific outfit with its items
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params
  try {
    const supabase = await createClient()

    // Get user session
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

    const outfitId = params.id

    if (!outfitId) {
      return NextResponse.json(
        { error: 'Outfit ID required' },
        { status: 400 }
      )
    }

    // Fetch outfit with items
    const { data: outfit, error } = await supabase
      .from('outfits')
      .select(
        `*,
        outfit_items(
          *,
          item:items(*)
        )`
      )
      .eq('id', outfitId)
      .eq('user_id', user.id)
      .single()

    if (error || !outfit) {
      return NextResponse.json(
        { error: 'Outfit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ outfit })
  } catch (error) {
    console.error('Outfit fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/outfits/:id
 * Update outfit (mark as worn, update occasion, etc.)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params
  try {
    const supabase = await createClient()

    // Get user session
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

    const outfitId = params.id

    if (!outfitId) {
      return NextResponse.json(
        { error: 'Outfit ID required' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { times_worn, last_worn, date_worn, occasion, name } = body

    // Verify outfit belongs to user
    const { data: outfit, error: fetchError } = await supabase
      .from('outfits')
      .select('id, user_id')
      .eq('id', outfitId)
      .single()

    if (fetchError || !outfit) {
      return NextResponse.json(
        { error: 'Outfit not found' },
        { status: 404 }
      )
    }

    if (outfit.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Build update object with proper typing
    interface OutfitUpdateData {
      times_worn?: number
      last_worn?: string | null
      date_worn?: string | null
      occasion?: string
      name?: string
    }

    const updateData: OutfitUpdateData = {}
    if (times_worn !== undefined) updateData.times_worn = times_worn
    if (last_worn !== undefined) updateData.last_worn = last_worn
    if (date_worn !== undefined) updateData.date_worn = date_worn
    if (occasion !== undefined) updateData.occasion = occasion
    if (name !== undefined) updateData.name = name

    // Update outfit
    const { data: updatedOutfit, error: updateError } = await supabase
      .from('outfits')
      .update(updateData)
      .eq('id', outfitId)
      .select(
        `*,
        outfit_items(
          *,
          item:items(*)
        )`
      )
      .single()

    if (updateError) {
      console.error('Failed to update outfit:', updateError)
      return NextResponse.json(
        { error: 'Failed to update outfit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ outfit: updatedOutfit })
  } catch (error) {
    console.error('Outfit update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
