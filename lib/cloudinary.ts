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
  tags?: string[]
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
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
 * Upload image with standardized aspect ratio (FREE tier only)
 * Uses category-specific dimensions for consistent sizing
 */
export async function uploadWithStandardization(
  file: File,
  category: string
): Promise<CloudinaryUploadResult> {
  try {
    const { getCategoryAspectRatio, STANDARD_DIMENSIONS } = await import(
      './image-standardization'
    )

    const aspectRatio = getCategoryAspectRatio(category)

    // Select dimensions based on aspect ratio
    let dimensions
    if (aspectRatio.width === 2 && aspectRatio.height === 1) {
      dimensions = STANDARD_DIMENSIONS.wide // Shoes (2:1)
    } else if (aspectRatio.width === aspectRatio.height) {
      dimensions = STANDARD_DIMENSIONS.square // Accessories (1:1)
    } else {
      dimensions = STANDARD_DIMENSIONS.portrait // Clothing (2:3)
    }

    // Convert File to base64 data URL
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString('base64')
    const dataURL = `data:${file.type};base64,${base64}`

    // Upload with standardized transformations (all FREE tier)
    const result = await cloudinary.uploader.upload(dataURL, {
      folder: 'sneaker-tracker/products',
      transformation: [
        {
          width: dimensions.width,
          height: dimensions.height,
          crop: 'fit',
          gravity: 'center',
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      ],
      tags: ['product-image', 'sneaker', `category-${category}`]
    })

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
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export default cloudinary