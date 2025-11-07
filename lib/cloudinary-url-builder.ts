/**
 * Cloudinary URL Builder
 *
 * Generates optimized Cloudinary URLs with transformations
 * to avoid Vercel Image Optimization costs.
 *
 * Free tier: 25GB storage + 25K transformations/month
 * Transformations are CDN-cached (only first request counts)
 */

// Get cloud name from environment
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

if (!CLOUDINARY_CLOUD_NAME) {
  console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Cloudinary URLs will fail.');
}

/**
 * Image size presets for different contexts
 */
export const IMAGE_SIZES = {
  thumbnail: 200,    // Small icons, avatars
  card: 400,         // Wardrobe item cards
  carousel: 800,     // Photo carousel, full-size view
  full: 1200,        // High-res modal view
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

/**
 * Transformation options for Cloudinary URLs
 */
export interface CloudinaryTransformOptions {
  width?: number | 'auto';
  height?: number | 'auto';
  quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'limit' | 'fill' | 'fit' | 'scale' | 'pad';
  gravity?: 'center' | 'face' | 'auto';
  dpr?: 'auto' | number;  // Device pixel ratio
  fetchFormat?: 'auto';
}

/**
 * Build optimized Cloudinary URL from public_id
 *
 * @param publicId - Cloudinary public_id (e.g., "folder/photo" or "v1234567890/folder/photo")
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 *
 * @example
 * buildCloudinaryUrl("my-folder/photo", { width: 400, quality: 'auto:good' })
 * // Returns: "https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto:good,w_400,c_limit,dpr_auto/my-folder/photo"
 */
export function buildCloudinaryUrl(
  publicId: string | null | undefined,
  options: CloudinaryTransformOptions = {}
): string {
  // Handle missing public_id
  if (!publicId || !CLOUDINARY_CLOUD_NAME) {
    return '/images/placeholder.jpg'; // Fallback placeholder
  }

  // Strip version prefix if present (v1234567890/)
  const cleanPublicId = publicId.replace(/^v\d+\//, '');

  // Default transformation options (optimized for performance)
  const {
    width = 'auto',
    height,
    quality = 'auto:good',
    format = 'auto',
    crop = 'limit',
    gravity,
    dpr = 'auto',
    fetchFormat = 'auto',
  } = options;

  // Build transformation string
  const transformations: string[] = [];

  // Format (WebP when supported)
  if (format) {
    transformations.push(`f_${format}`);
  }

  // Quality (automatic optimization)
  if (quality) {
    transformations.push(`q_${quality}`);
  }

  // Width
  if (width) {
    transformations.push(`w_${width}`);
  }

  // Height
  if (height) {
    transformations.push(`h_${height}`);
  }

  // Crop mode
  if (crop) {
    transformations.push(`c_${crop}`);
  }

  // Gravity (for cropping)
  if (gravity) {
    transformations.push(`g_${gravity}`);
  }

  // Device pixel ratio (retina support)
  if (dpr) {
    transformations.push(`dpr_${dpr}`);
  }

  // Fetch format (for automatic format selection)
  if (fetchFormat) {
    transformations.push(`fetch_format_${fetchFormat}`);
  }

  // Construct final URL
  const transformString = transformations.join(',');
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  return `${baseUrl}/${transformString}/${cleanPublicId}`;
}

/**
 * Build Cloudinary URL with size preset
 *
 * @param publicId - Cloudinary public_id
 * @param size - Preset size key ('thumbnail' | 'card' | 'carousel' | 'full')
 * @param options - Additional transformation options
 * @returns Optimized Cloudinary URL
 *
 * @example
 * buildCloudinaryUrlWithSize("my-folder/photo", "card")
 * // Returns URL with w_400
 */
export function buildCloudinaryUrlWithSize(
  publicId: string | null | undefined,
  size: ImageSize,
  options: Omit<CloudinaryTransformOptions, 'width'> = {}
): string {
  return buildCloudinaryUrl(publicId, {
    width: IMAGE_SIZES[size],
    ...options,
  });
}

/**
 * Build blur placeholder URL for progressive loading
 *
 * @param publicId - Cloudinary public_id
 * @returns Low-quality blur URL (fast loading)
 *
 * @example
 * buildBlurPlaceholder("my-folder/photo")
 * // Returns URL with w_100,q_20,e_blur:300
 */
export function buildBlurPlaceholder(publicId: string | null | undefined): string {
  if (!publicId || !CLOUDINARY_CLOUD_NAME) {
    return '/images/placeholder.jpg';
  }

  const cleanPublicId = publicId.replace(/^v\d+\//, '');
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  // Very low quality, small size, heavy blur
  return `${baseUrl}/w_100,h_100,q_20,f_auto,e_blur:300/${cleanPublicId}`;
}

/**
 * Extract public_id from full Cloudinary URL
 *
 * @param url - Full Cloudinary URL
 * @returns Extracted public_id or null
 *
 * @example
 * extractPublicIdFromUrl("https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/folder/photo.jpg")
 * // Returns: "folder/photo"
 */
export function extractPublicIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    // Match pattern: /upload/(v1234567890/)?folder/photo.jpg
    const match = url.match(/\/upload\/(v\d+\/)?(.+?)(\.\w+)?$/);
    if (match && match[2]) {
      return match[2]; // Returns "folder/photo"
    }
  } catch (error) {
    console.error('Failed to extract public_id from URL:', error);
  }

  return null;
}

/**
 * Check if URL is a Cloudinary URL
 *
 * @param url - URL to check
 * @returns True if Cloudinary URL
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com');
}
