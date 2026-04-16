import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    const result = await cloudinary.uploader.upload(url, {
      folder: 'sneaker-tracker/products',
      transformation: [
        { width: 800, height: 800, crop: 'fit', quality: 'auto' },
        { format: 'auto' },
      ],
      tags: ['product-image', 'sneaker', 'bulk-import'],
    })

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    })
  } catch (error) {
    console.error('Upload-from-url error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    )
  }
}
