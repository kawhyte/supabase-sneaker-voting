import { SizingJournalEntry } from './sizing-journal-entry'

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
  item?: SizingJournalEntry
}

/**
 * OutfitWithItems - Full outfit with resolved item data
 */
export interface OutfitWithItems extends Outfit {
  outfit_items: (OutfitItem & { item: SizingJournalEntry })[]
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
  item?: SizingJournalEntry
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
    icon: '👕',
    color: 'blue',
    description: 'Everyday comfort wear',
  },
  work: {
    label: 'Work',
    icon: '💼',
    color: 'slate',
    description: 'Professional office attire',
  },
  date: {
    label: 'Date',
    icon: '💕',
    color: 'pink',
    description: 'Going out for a special occasion',
  },
  gym: {
    label: 'Gym',
    icon: '💪',
    color: 'green',
    description: 'Athletic and active wear',
  },
  formal: {
    label: 'Formal',
    icon: '🎩',
    color: 'purple',
    description: 'Black tie and formal events',
  },
  travel: {
    label: 'Travel',
    icon: '✈️',
    color: 'sky',
    description: 'Comfortable travel clothing',
  },
  weekend: {
    label: 'Weekend',
    icon: '🌞',
    color: 'amber',
    description: 'Relaxed weekend plans',
  },
  night_out: {
    label: 'Night Out',
    icon: '🌙',
    color: 'indigo',
    description: 'Evening and social activities',
  },
  other: {
    label: 'Other',
    icon: '✨',
    color: 'stone',
    description: 'Special or unique occasion',
  },
}

/**
 * Configuration for seasons with UI metadata
 */
export const SEASON_CONFIG: Record<OutfitSeason, {
  label: string
  icon: string
  months: number[] // Month numbers (1-12)
}> = {
  spring: {
    label: 'Spring',
    icon: '🌱',
    months: [3, 4, 5],
  },
  summer: {
    label: 'Summer',
    icon: '☀️',
    months: [6, 7, 8],
  },
  fall: {
    label: 'Fall',
    icon: '🍂',
    months: [9, 10, 11],
  },
  winter: {
    label: 'Winter',
    icon: '❄️',
    months: [12, 1, 2],
  },
  all_year: {
    label: 'All Year',
    icon: '🌍',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
}
