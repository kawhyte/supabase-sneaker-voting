import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  id: string
}

/**
 * PATCH /api/outfit-items/[id]
 * Update an outfit item (position, size, z-index, etc.)
 */
export async function PATCH(
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

    // Parse request body
    const body = await request.json()
    const {
      position_x,
      position_y,
      z_index,
      display_width,
      display_height,
      crop_x,
      crop_y,
      crop_width,
      crop_height,
      cropped_image_url,
    } = body

    // Build update object with only provided fields
    const updateData: any = {}
    if (position_x !== undefined) updateData.position_x = position_x
    if (position_y !== undefined) updateData.position_y = position_y
    if (z_index !== undefined) updateData.z_index = z_index
    if (display_width !== undefined) updateData.display_width = display_width
    if (display_height !== undefined) updateData.display_height = display_height
    if (crop_x !== undefined) updateData.crop_x = crop_x
    if (crop_y !== undefined) updateData.crop_y = crop_y
    if (crop_width !== undefined) updateData.crop_width = crop_width
    if (crop_height !== undefined) updateData.crop_height = crop_height
    if (cropped_image_url !== undefined) updateData.cropped_image_url = cropped_image_url

    // Update the outfit item
    const { data: updatedItem, error } = await supabase
      .from('outfit_items')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update outfit item:', error)
      return NextResponse.json(
        { error: 'Failed to update outfit item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ outfit_item: updatedItem })
  } catch (error) {
    console.error('Outfit item update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/outfit-items/[id]
 * Delete an outfit item from an outfit
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

    // Delete the outfit item
    const { error } = await supabase
      .from('outfit_items')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Failed to delete outfit item:', error)
      return NextResponse.json(
        { error: 'Failed to delete outfit item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Outfit item delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
