import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/outfits
 * Save a new outfit with items to the database
 */
export async function POST(request: NextRequest) {
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
      name,
      description,
      occasion,
      background_color,
      outfit_items,
    } = body

    // Validate required fields
    if (!name || !Array.isArray(outfit_items) || outfit_items.length === 0) {
      return NextResponse.json(
        { error: 'Outfit name and at least one item required' },
        { status: 400 }
      )
    }

    // Create outfit
    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        occasion: occasion || 'casual',
        background_color: background_color || '#FFFFFF',
      })
      .select()
      .single()

    if (outfitError) {
      console.error('Failed to create outfit:', outfitError)
      return NextResponse.json(
        { error: 'Failed to create outfit' },
        { status: 500 }
      )
    }

    // Create outfit items
    const outfitItemsData = outfit_items.map((item: any, index: number) => ({
      outfit_id: outfit.id,
      item_id: item.item_id,
      position_x: item.position_x || 0.5,
      position_y: item.position_y || 0.5,
      z_index: item.z_index || 0,
      display_width: item.display_width || 0.3,
      display_height: item.display_height || 0.3,
      item_order: index,
      crop_x: item.crop_x || null,
      crop_y: item.crop_y || null,
      crop_width: item.crop_width || null,
      crop_height: item.crop_height || null,
      cropped_image_url: item.cropped_image_url || null,
    }))

    const { data: createdItems, error: itemsError } = await supabase
      .from('outfit_items')
      .insert(outfitItemsData)
      .select()

    if (itemsError) {
      console.error('Failed to create outfit items:', itemsError)
      // Optionally delete the outfit if items fail
      await supabase.from('outfits').delete().eq('id', outfit.id)
      return NextResponse.json(
        { error: 'Failed to add items to outfit' },
        { status: 500 }
      )
    }

    // Return created outfit with items
    return NextResponse.json({
      outfit,
      outfit_items: createdItems,
    })
  } catch (error) {
    console.error('Outfit creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/outfits
 * Fetch user's outfits
 */
export async function GET(request: NextRequest) {
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

    // Fetch user's outfits with items and item photos
    const { data: outfits, error } = await supabase
      .from('outfits')
      .select(
        `*,
        outfit_items(
          *,
          item:items(
            *,
            item_photos(*)
          )
        )`
      )
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch outfits:', error)
      return NextResponse.json(
        { error: 'Failed to fetch outfits' },
        { status: 500 }
      )
    }

    return NextResponse.json({ outfits })
  } catch (error) {
    console.error('Outfit fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
