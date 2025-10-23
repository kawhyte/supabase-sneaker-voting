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
