'use server'

import { createClient } from '@/utils/supabase/server'
import { generateSneakerPalette } from '@/lib/color-utils'
import { revalidatePath } from 'next/cache'

export interface ColorAnalysisResult {
  success: boolean
  message: string
  itemId?: string
  palette?: { bold: string[]; muted: string[] }
  primaryColor?: string
}

/**
 * Analyzes a single item's image and saves the generated color palette
 * to the database.
 *
 * @param itemId - The UUID of the item to analyze
 * @param imageUrl - The Cloudinary URL or image URL to analyze
 * @returns Result object with success status and generated colors
 */
export async function analyzeAndSaveColors(
  itemId: string,
  imageUrl: string
): Promise<ColorAnalysisResult> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }

    // Verify item belongs to user
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, user_id')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return {
        success: false,
        message: 'Item not found'
      }
    }

    if (item.user_id !== user.id) {
      return {
        success: false,
        message: 'Unauthorized'
      }
    }

    // Generate color palette (both bold and muted)
    const palette = await generateSneakerPalette(imageUrl)

    // Save to database (save as object with bold/muted arrays)
    const { error: updateError } = await supabase
      .from('items')
      .update({
        color_palette: { bold: palette.bold, muted: palette.muted },
        primary_color: palette.primaryColor,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)

    if (updateError) {
      console.error('Error updating item colors:', updateError)
      return {
        success: false,
        message: 'Failed to save color palette'
      }
    }

    // Revalidate the outfits page to show updated colors
    revalidatePath('/outfits')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Color palette generated successfully',
      itemId,
      palette: { bold: palette.bold, muted: palette.muted },
      primaryColor: palette.primaryColor
    }

  } catch (error) {
    console.error('Error in analyzeAndSaveColors:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export interface MigrationResult {
  success: boolean
  message: string
  processed: number
  succeeded: number
  failed: number
  errors: Array<{ itemId: string; error: string }>
}

/**
 * Batch processes all sneakers/footwear items that don't have color palettes yet.
 * This is a temporary migration function to populate existing items.
 *
 * @returns Result object with migration statistics
 */
export async function migrateAllSneakers(): Promise<MigrationResult> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required',
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      }
    }

    // Fetch all footwear items without color palettes
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('id, image_url, category')
      .eq('user_id', user.id)
      .in('category', ['sneakers', 'shoes', 'footwear'])
      .is('color_palette', null)
      .not('image_url', 'is', null)

    if (fetchError) {
      console.error('Error fetching items:', fetchError)
      return {
        success: false,
        message: 'Failed to fetch items',
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      }
    }

    if (!items || items.length === 0) {
      return {
        success: true,
        message: 'No items found that need color analysis',
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      }
    }

    let succeeded = 0
    let failed = 0
    const errors: Array<{ itemId: string; error: string }> = []

    // Process each item
    for (const item of items) {
      try {
        if (!item.image_url) continue

        // Generate palette (both bold and muted)
        const palette = await generateSneakerPalette(item.image_url)

        // Update database with new object structure
        const { error: updateError } = await supabase
          .from('items')
          .update({
            color_palette: { bold: palette.bold, muted: palette.muted },
            primary_color: palette.primaryColor,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        if (updateError) {
          failed++
          errors.push({
            itemId: item.id,
            error: updateError.message
          })
        } else {
          succeeded++
        }

      } catch (error) {
        failed++
        errors.push({
          itemId: item.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Revalidate pages after batch update
    revalidatePath('/outfits')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Migration complete: ${succeeded} succeeded, ${failed} failed out of ${items.length} items`,
      processed: items.length,
      succeeded,
      failed,
      errors
    }

  } catch (error) {
    console.error('Error in migrateAllSneakers:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    }
  }
}

/**
 * Gets the color palette for a specific item (read-only)
 *
 * @param itemId - The UUID of the item
 * @returns The color palette or null if not found
 */
export async function getItemColorPalette(itemId: string): Promise<{
  colors: string[] | null
  primaryColor: string | null
}> {
  try {
    const supabase = await createClient()

    const { data: item, error } = await supabase
      .from('items')
      .select('color_palette, primary_color')
      .eq('id', itemId)
      .single()

    if (error || !item) {
      return { colors: null, primaryColor: null }
    }

    return {
      colors: item.color_palette as string[] | null,
      primaryColor: item.primary_color
    }
  } catch (error) {
    console.error('Error fetching color palette:', error)
    return { colors: null, primaryColor: null }
  }
}

/**
 * Migrates all legacy palettes (array format) to the new dual-vibe format (object with bold/muted).
 * Re-generates both Bold and Muted palettes from the original images.
 *
 * @returns Result object with migration statistics
 */
export async function migrateLegacyPalettes(): Promise<MigrationResult> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required',
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      }
    }

    // Fetch all items with legacy palette format (JSONB array instead of object)
    // We need to fetch items where color_palette is not null but doesn't have 'bold' key
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('id, image_url, color_palette, category, item_photos(image_url, is_main_image)')
      .eq('user_id', user.id)
      .not('color_palette', 'is', null)

    if (fetchError) {
      console.error('Error fetching items:', fetchError)
      return {
        success: false,
        message: 'Failed to fetch items',
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      }
    }

    if (!items || items.length === 0) {
      return {
        success: true,
        message: 'No items found with color palettes',
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      }
    }

    // Filter items that have legacy format (array instead of object with bold/muted)
    const legacyItems = items.filter(item => {
      if (!item.color_palette) return false
      // Check if it's an array (legacy) or object with bold/muted (new)
      return Array.isArray(item.color_palette)
    })

    if (legacyItems.length === 0) {
      return {
        success: true,
        message: 'No legacy palettes found - all items already use the new format',
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      }
    }

    let succeeded = 0
    let failed = 0
    const errors: Array<{ itemId: string; error: string }> = []

    // Process each legacy item
    for (const item of legacyItems) {
      try {
        // Get image URL (priority: main photo > legacy > first photo)
        const mainPhoto = item.item_photos?.find((photo: any) => photo.is_main_image)
        const imageUrl = mainPhoto?.image_url || item.image_url || item.item_photos?.[0]?.image_url

        if (!imageUrl) {
          failed++
          errors.push({
            itemId: item.id,
            error: 'No image URL found'
          })
          continue
        }

        // Re-generate palette from original image (will create both bold and muted)
        const palette = await generateSneakerPalette(imageUrl)

        // Update database with new object structure
        const { error: updateError } = await supabase
          .from('items')
          .update({
            color_palette: { bold: palette.bold, muted: palette.muted },
            primary_color: palette.primaryColor,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        if (updateError) {
          failed++
          errors.push({
            itemId: item.id,
            error: updateError.message
          })
        } else {
          succeeded++
        }

      } catch (error) {
        failed++
        errors.push({
          itemId: item.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Revalidate pages after migration
    revalidatePath('/outfits')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Migration complete: ${succeeded} succeeded, ${failed} failed out of ${legacyItems.length} legacy palettes`,
      processed: legacyItems.length,
      succeeded,
      failed,
      errors
    }

  } catch (error) {
    console.error('Error in migrateLegacyPalettes:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    }
  }
}
