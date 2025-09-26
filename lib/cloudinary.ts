import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface UploadOptions {
  folder?: string
  transformation?: object[]
  quality?: string | number
  format?: string
}

/**
 * Upload image to Cloudinary with optimization
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Convert File to base64 data URL
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString('base64')
    const dataURL = `data:${file.type};base64,${base64}`

    // Default options for product images
    const defaultOptions = {
      folder: 'sneaker-tracker/products',
      transformation: [
        { width: 800, height: 800, crop: 'fit', quality: 'auto' },
        { format: 'auto' } // Auto-format (WebP when supported)
      ],
      tags: ['product-image', 'sneaker'],
      ...options
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURL, defaultOptions)

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Generate optimized image URL with transformations
 */
export function generateImageUrl(
  publicId: string,
  transformations: object[] = []
): string {
  const defaultTransformations = [
    { width: 400, height: 400, crop: 'fit', quality: 'auto' },
    { format: 'auto' }
  ]

  return cloudinary.url(publicId, {
    transformation: transformations.length > 0 ? transformations : defaultTransformations,
    secure: true
  })
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error(`Failed to delete image: ${error.message || 'Unknown error'}`)
  }
}

export default cloudinary