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
  // Shoes: Wide aspect ratio (2:1) - shoes are typically wider than tall
  sneakers: { width: 2, height: 1, crop: 'fit', gravity: 'center' },
  shoes: { width: 2, height: 1, crop: 'fit', gravity: 'center' },

  // Tops: Portrait aspect ratio (2:3) - fit shirts well
  tops: { width: 2, height: 3, crop: 'fit', gravity: 'center' },
  shirts: { width: 2, height: 3, crop: 'fit', gravity: 'center' },

  // Bottoms: Portrait aspect ratio (2:3) - pants are vertical
  bottoms: { width: 2, height: 3, crop: 'fit', gravity: 'center' },
  pants: { width: 2, height: 3, crop: 'fit', gravity: 'center' },

  // Outerwear: Portrait aspect ratio (2:3) - jackets are vertical
  outerwear: { width: 2, height: 3, crop: 'fit', gravity: 'center' },
  jackets: { width: 2, height: 3, crop: 'fit', gravity: 'center' },

  // Accessories: Square (1:1) - varies wildly, so use square
  accessories: { width: 1, height: 1, crop: 'fit', gravity: 'center' },
  bags: { width: 1, height: 1, crop: 'fit', gravity: 'center' },
  hats: { width: 1, height: 1, crop: 'fit', gravity: 'center' },
  other: { width: 1, height: 1, crop: 'fit', gravity: 'center' }
} as const

// Standard dimensions (for consistent sizing)
export const STANDARD_DIMENSIONS = {
  wide: { width: 1600, height: 800 }, // 2:1 (shoes - wider than tall)
  square: { width: 800, height: 800 }, // 1:1 (accessories)
  portrait: { width: 800, height: 1200 } // 2:3 (tops, bottoms, outerwear)
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

  // Select dimensions based on aspect ratio
  let dimensions
  if (aspectRatio.width === 2 && aspectRatio.height === 1) {
    dimensions = STANDARD_DIMENSIONS.wide // Shoes (2:1)
  } else if (aspectRatio.width === aspectRatio.height) {
    dimensions = STANDARD_DIMENSIONS.square // Accessories (1:1)
  } else {
    dimensions = STANDARD_DIMENSIONS.portrait // Clothing (2:3)
  }

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
