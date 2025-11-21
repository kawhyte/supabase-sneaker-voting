import { WardrobeItem } from './WardrobeItem'

/**
 * Outfit - User-created outfit composition
 * Represents a complete outfit with positioned items on a phone mockup canvas
 */
export interface Outfit {
  id: string
  user_id: string
  name: string
  description?: string
  occasion?: OutfitOccasion
  background_color: string // Hex color for phone mockup background

  // Wear tracking
  date_created: string
  date_worn?: string | null
  times_worn: number
  last_worn?: string | null

  // Status
  is_archived: boolean

  // Preview generation (for flat-lay card preview)
  preview_url?: string | null
  preview_status?: 'pending' | 'generating' | 'generated' | 'failed'
  preview_generated_at?: string | null
  preview_error?: string | null

  // Metadata
  created_at: string
  updated_at: string

  // Relations
  outfit_items?: OutfitItem[]
}

/**
 * OutfitItem - An item within an outfit with visual positioning
 */
export interface OutfitItem {
  id: string
  outfit_id: string
  item_id: string

  // Visual positioning (normalized 0.0-1.0)
  position_x: number
  position_y: number
  z_index: number // Layer order

  // Photo crop data
  crop_x?: number | null
  crop_y?: number | null
  crop_width?: number | null
  crop_height?: number | null
  cropped_image_url?: string | null

  // Display size on canvas
  display_width: number
  display_height: number

  // Order
  item_order: number

  // Metadata
  created_at: string
  updated_at: string

  // Relations
  item?: WardrobeItem
}

/**
 * OutfitWithItems - Full outfit with resolved item data
 */
export interface OutfitWithItems extends Outfit {
  outfit_items: (OutfitItem & { item: WardrobeItem })[]
}

/**
 * Occasion types for outfit planning
 */
export type OutfitOccasion =
  | 'casual'
  | 'work'
  | 'date'
  | 'gym'
  | 'formal'
  | 'travel'
  | 'weekend'
  | 'night_out'
  | 'other'

/**
 * Outfit creation form data
 */
export interface OutfitFormData {
  name: string
  description?: string
  occasion?: OutfitOccasion
  background_color: string
  outfit_items: OutfitItemFormData[]
}

/**
 * Outfit item form data (for creating/updating)
 */
export interface OutfitItemFormData {
  item_id: string
  position_x: number
  position_y: number
  z_index: number
  display_width: number
  display_height: number
  crop_x?: number | null
  crop_y?: number | null
  crop_width?: number | null
  crop_height?: number | null
  cropped_image_url?: string | null
}

/**
 * Item positioning on canvas
 */
export interface ItemPosition {
  x: number // Pixel position
  y: number // Pixel position
  layer: number // Z-index
  width: number // Pixel width
  height: number // Pixel height
}

/**
 * Category layer mapping for auto-arrange
 */
export interface CategoryLayerConfig {
  layer: number
  yPercent: number // Where to place vertically (0.1 = top, 0.9 = bottom)
  zIndex: number
}

/**
 * Crop area for manual crop tool
 */
export interface CropArea {
  x: number // 0-1 normalized
  y: number // 0-1 normalized
  width: number // 0-1 normalized
  height: number // 0-1 normalized
}

/**
 * Season type for seasonal filtering
 */
export type OutfitSeason =
  | 'spring'
  | 'summer'
  | 'fall'
  | 'winter'
  | 'all_year'

/**
 * Outfit filtering and sorting options
 */
export interface OutfitFilter {
  occasion?: OutfitOccasion
  season?: OutfitSeason
  date_range?: {
    start: string // ISO date
    end: string // ISO date
  }
  search?: string // Search in name and description
  is_archived?: boolean
  sort_by?: 'newest' | 'oldest' | 'most_worn' | 'recently_worn'
}

/**
 * Outfit creation input (excludes auto-generated fields)
 */
export interface OutfitCreateInput {
  name: string
  description?: string
  occasion?: OutfitOccasion
  background_color?: string
}

/**
 * Outfit update input (all fields optional)
 */
export interface OutfitUpdateInput {
  name?: string
  description?: string
  occasion?: OutfitOccasion
  background_color?: string
  date_worn?: string | null
  times_worn?: number
  last_worn?: string | null
  is_archived?: boolean
}

/**
 * Outfit item creation input
 */
export interface OutfitItemCreateInput {
  item_id: string
  position_x?: number
  position_y?: number
  z_index?: number
  display_width?: number
  display_height?: number
  item_order?: number
}

/**
 * Outfit item update input
 */
export interface OutfitItemUpdateInput {
  position_x?: number
  position_y?: number
  z_index?: number
  crop_x?: number | null
  crop_y?: number | null
  crop_width?: number | null
  crop_height?: number | null
  cropped_image_url?: string | null
  display_width?: number
  display_height?: number
  item_order?: number
}

/**
 * Outfit statistics
 */
export interface OutfitStats {
  total_outfits: number
  total_wears: number
  average_wears_per_outfit: number
  most_worn_outfit_id?: string
  most_worn_outfit_count?: number
  outfits_by_occasion: Record<OutfitOccasion, number>
  items_used_count: number
}

/**
 * Canvas configuration for outfit rendering
 */
export interface OutfitCanvasConfig {
  width_px: number
  height_px: number
  background_color: string
  show_grid: boolean
  snap_to_grid: boolean
  grid_size: number
}

/**
 * Drag and drop data for outfit building
 */
export interface OutfitDragData {
  type: 'item' | 'outfit_item'
  item_id?: string
  outfit_item_id?: string
  outfit_id?: string
  item?: WardrobeItem
  source: 'sidebar' | 'canvas'
}

/**
 * Z-index layer enum for outfit items
 */
export enum OutfitLayer {
  SHOES = 0,
  BOTTOMS = 1,
  TOPS = 2,
  OUTERWEAR = 3,
  ACCESSORIES = 4,
}

/**
 * Configuration for outfit occasions with UI metadata
 */
export const OCCASION_CONFIG: Record<OutfitOccasion, {
  label: string
  icon: string
  color: string
  description: string
}> = {
  casual: {
    label: 'Casual',
    icon: 'Shirt',
    color: 'blue',
    description: 'Everyday comfort wear',
  },
  work: {
    label: 'Work',
    icon: 'Briefcase',
    color: 'slate',
    description: 'Professional office attire',
  },
  date: {
    label: 'Date',
    icon: 'Heart',
    color: 'pink',
    description: 'Going out for a special occasion',
  },
  gym: {
    label: 'Gym',
    icon: 'Dumbbell',
    color: 'green',
    description: 'Athletic and active wear',
  },
  formal: {
    label: 'Formal',
    icon: 'Crown',
    color: 'purple',
    description: 'Black tie and formal events',
  },
  travel: {
    label: 'Travel',
    icon: 'Plane',
    color: 'sky',
    description: 'Comfortable travel clothing',
  },
  weekend: {
    label: 'Weekend',
    icon: 'Sun',
    color: 'amber',
    description: 'Relaxed weekend plans',
  },
  night_out: {
    label: 'Night Out',
    icon: 'Moon',
    color: 'indigo',
    description: 'Evening and social activities',
  },
  other: {
    label: 'Other',
    icon: 'Sparkles',
    color: 'stone',
    description: 'Special or unique occasion',
  },
}

/**
 * Configuration for seasons with UI metadata
 */
export const SEASON_CONFIG: Record<OutfitSeason, {
  label: string
  icon: string // Lucide icon name
  months: number[] // Month numbers (1-12)
}> = {
  spring: {
    label: 'Spring',
    icon: 'Sprout',
    months: [3, 4, 5],
  },
  summer: {
    label: 'Summer',
    icon: 'Sun',
    months: [6, 7, 8],
  },
  fall: {
    label: 'Fall',
    icon: 'Leaf',
    months: [9, 10, 11],
  },
  winter: {
    label: 'Winter',
    icon: 'Snowflake',
    months: [12, 1, 2],
  },
  all_year: {
    label: 'All Year',
    icon: 'Globe',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
}

// ============================================================================
// CATEGORY QUOTA TYPES
// ============================================================================

/**
 * Defines quota rules for outfit item categories
 * - Shoes, Tops, Bottoms, Outerwear: Maximum 1 each
 * - Accessories, Bags, Hats, Jewelry, Watches, Socks: Unlimited
 */
export interface CategoryQuota {
  category: string          // Category name (e.g., "shoes", "tops")
  max: number | null        // Maximum allowed (null = unlimited)
  label: string             // Display label (e.g., "Shoes")
  icon?: string             // Optional icon name (for UI)
}

/**
 * Quota validation result for a specific category
 */
export interface QuotaValidation {
  category: string
  current: number           // Current count in outfit
  max: number | null        // Maximum allowed
  isAtLimit: boolean        // true if current >= max
  canAdd: boolean           // true if can add more items
  message?: string          // Optional user-facing message
}

/**
 * Complete quota status for an outfit
 */
export interface OutfitQuotaStatus {
  quotas: Record<string, QuotaValidation>  // Keyed by category
  violations: QuotaValidation[]            // Categories exceeding limits
  isValid: boolean                         // true if no violations
}

/**
 * Quota rules for each category
 *
 * Restricted (max 1):
 * - Shoes (sneakers, shoes)
 * - Tops (tops, sweaters, shirts)
 * - Bottoms (bottoms, pants, shorts, skirts)
 * - Outerwear (outerwear, jackets, coats)
 *
 * Unlimited:
 * - Accessories (accessories, bags, hats, jewelry, watches, socks)
 */
export const QUOTA_RULES: Record<string, CategoryQuota> = {
  // SHOES (max 1)
  'sneakers': {
    category: 'sneakers',
    max: 1,
    label: 'Shoes',
    icon: 'Footprints',
  },
  'shoes': {
    category: 'shoes',
    max: 1,
    label: 'Shoes',
    icon: 'Footprints',
  },

  // TOPS (max 1)
  'tops': {
    category: 'tops',
    max: 1,
    label: 'Tops',
    icon: 'Shirt',
  },
  'sweaters': {
    category: 'sweaters',
    max: 1,
    label: 'Tops',
    icon: 'Shirt',
  },
  'shirts': {
    category: 'shirts',
    max: 1,
    label: 'Tops',
    icon: 'Shirt',
  },

  // BOTTOMS (max 1)
  'bottoms': {
    category: 'bottoms',
    max: 1,
    label: 'Bottoms',
    icon: 'PantsIcon',
  },
  'pants': {
    category: 'pants',
    max: 1,
    label: 'Bottoms',
    icon: 'PantsIcon',
  },
  'shorts': {
    category: 'shorts',
    max: 1,
    label: 'Bottoms',
    icon: 'PantsIcon',
  },
  'skirts': {
    category: 'skirts',
    max: 1,
    label: 'Bottoms',
    icon: 'PantsIcon',
  },

  // OUTERWEAR (max 1)
  'outerwear': {
    category: 'outerwear',
    max: 1,
    label: 'Outerwear',
    icon: 'Coat',
  },
  'jackets': {
    category: 'jackets',
    max: 1,
    label: 'Outerwear',
    icon: 'Coat',
  },
  'coats': {
    category: 'coats',
    max: 1,
    label: 'Outerwear',
    icon: 'Coat',
  },

  // ACCESSORIES (unlimited)
  'accessories': {
    category: 'accessories',
    max: null,
    label: 'Accessories',
    icon: 'Watch',
  },
  'bags': {
    category: 'bags',
    max: null,
    label: 'Accessories',
    icon: 'ShoppingBag',
  },
  'hats': {
    category: 'hats',
    max: null,
    label: 'Accessories',
    icon: 'HardHat',
  },
  'jewelry': {
    category: 'jewelry',
    max: null,
    label: 'Accessories',
    icon: 'Gem',
  },
  'watches': {
    category: 'watches',
    max: null,
    label: 'Accessories',
    icon: 'Watch',
  },
  'socks': {
    category: 'socks',
    max: null,
    label: 'Accessories',
    icon: 'Shirt',
  },

  // FALLBACK (unlimited)
  'other': {
    category: 'other',
    max: null,
    label: 'Other',
    icon: 'Box',
  },
}

/**
 * Helper: Get quota for a category (with fallback to unlimited)
 */
export function getQuotaForCategory(category: string): CategoryQuota {
  return QUOTA_RULES[category.toLowerCase()] || {
    category: category,
    max: null,
    label: category,
  }
}
