/**
 * Image Standardization using Cloudinary FREE tier
 *
 * Features used (all FREE):
 * - Basic crop (fill, fit, scale)
 * - Resize
 * - Format optimization (auto WebP/AVIF)
 * - Quality optimization
 */

export const CATEGORY_ASPECT_RATIOS = {
  sneakers: { width: 1, height: 1, crop: 'fill', gravity: 'center' }, // 1:1 square
  shoes: { width: 1, height: 1, crop: 'fill', gravity: 'center' },

  tops: { width: 2, height: 3, crop: 'fill', gravity: 'center' }, // 2:3 portrait
  shirts: { width: 2, height: 3, crop: 'fill', gravity: 'center' },

  bottoms: { width: 2, height: 3, crop: 'fill', gravity: 'center' },
  pants: { width: 2, height: 3, crop: 'fill', gravity: 'center' },

  outerwear: { width: 2, height: 3, crop: 'fill', gravity: 'center' },
  jackets: { width: 2, height: 3, crop: 'fill', gravity: 'center' },

  accessories: { width: 1, height: 1, crop: 'fill', gravity: 'center' },
  bags: { width: 1, height: 1, crop: 'fill', gravity: 'center' },
  hats: { width: 1, height: 1, crop: 'fill', gravity: 'center' },
  other: { width: 1, height: 1, crop: 'fill', gravity: 'center' }
} as const

// Standard dimensions (for consistent sizing)
export const STANDARD_DIMENSIONS = {
  square: { width: 800, height: 800 }, // 1:1
  portrait: { width: 800, height: 1200 } // 2:3
}

/**
 * Generates Cloudinary URL with FREE tier transformations
 * No paid features used
 */
export function getStandardizedImageUrl(
  originalUrl: string,
  category: string
): string {
  const aspectRatio =
    CATEGORY_ASPECT_RATIOS[category as keyof typeof CATEGORY_ASPECT_RATIOS] ||
    CATEGORY_ASPECT_RATIOS.other
  const dimensions =
    aspectRatio.width === aspectRatio.height
      ? STANDARD_DIMENSIONS.square
      : STANDARD_DIMENSIONS.portrait

  // Build Cloudinary transformation URL (FREE tier only)
  const transformations = [
    `c_${aspectRatio.crop}`, // Basic crop (FREE)
    `g_${aspectRatio.gravity}`, // Gravity (FREE)
    `w_${dimensions.width}`, // Width (FREE)
    `h_${dimensions.height}`, // Height (FREE)
    'q_auto:good', // Quality optimization (FREE)
    'f_auto' // Format optimization (FREE)
  ].join(',')

  // If already Cloudinary URL, add transformations
  if (originalUrl.includes('res.cloudinary.com')) {
    return originalUrl.replace('/upload/', `/upload/${transformations}/`)
  }

  // If external URL, return as-is (would need upload first)
  return originalUrl
}

/**
 * Gets aspect ratio for category
 */
export function getCategoryAspectRatio(
  category: string
): { width: number; height: number } {
  const ratio =
    CATEGORY_ASPECT_RATIOS[category as keyof typeof CATEGORY_ASPECT_RATIOS] ||
    CATEGORY_ASPECT_RATIOS.other
  return { width: ratio.width, height: ratio.height }
}
