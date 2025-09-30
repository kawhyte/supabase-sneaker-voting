import { NextRequest, NextResponse } from 'next/server'
import { deleteFromCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json(
        { error: 'No public ID provided' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId)

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Delete API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete image'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}