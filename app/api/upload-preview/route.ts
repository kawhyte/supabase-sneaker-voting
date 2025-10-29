import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

interface UploadPreviewRequest {
  dataUrl: string
  outfitId: string
}

/**
 * POST /api/upload-preview
 *
 * Uploads generated preview (data URL) to Cloudinary
 * and updates the outfit record with the preview URL
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dataUrl, outfitId }: UploadPreviewRequest = await request.json()

    if (!dataUrl || !outfitId) {
      return NextResponse.json(
        { error: 'Missing dataUrl or outfitId' },
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
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 })
    }

    if (outfit.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Convert data URL to File for upload
    const base64Data = dataUrl.split(',')[1]
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid data URL format' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(base64Data, 'base64')
    const file = new File([buffer], `outfit-${outfitId}-preview.jpg`, {
      type: 'image/jpeg'
    })

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, {
      folder: 'sneaker-tracker/outfit-previews',
      tags: ['outfit-preview', `outfit-${outfitId}`]
    })

    // Update outfit with preview URL
    const { error: updateError } = await supabase
      .from('outfits')
      .update({
        preview_url: result.secure_url,
        preview_status: 'generated',
        preview_generated_at: new Date().toISOString()
      })
      .eq('id', outfitId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update outfit preview' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('Upload preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
