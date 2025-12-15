import type { ItemCategory } from "./item-category"
import type { ItemStatus } from "@/types/ItemStatus"
import type { SizeType } from "@/types/SizeType"

export interface ItemPhoto {
  id: string
  image_url: string
  image_order: number
  is_main_image: boolean
  cloudinary_id?: string
}

export interface BrandData {
  id: number
  name: string | null
  brand_logo: string | null
}

export type ArchiveReason = 'sold' | 'donated' | 'worn_out' | 'other'

export interface WardrobeItem {
  id: string
  created_at: string
  user_id: string
  brand: string
  brand_id: number | null
  model: string
  color: string
  category: ItemCategory
  size_type: SizeType
  size_tried: string | null
  comfort_rating?: number
  store_name?: string
  store_url?: string | null
  try_on_date: string
  notes?: string
  retail_price?: number
  sale_price?: number
  purchase_price?: number
  purchase_date?: string | null
  target_price?: number
  ideal_price?: number
  would_recommend: boolean | null
  image_url?: string
  cloudinary_id?: string
  item_photos?: ItemPhoto[]
  wears?: number
  last_worn_date?: string | null
  is_archived?: boolean
  archive_reason?: ArchiveReason | null
  archived_at?: string | null
  brands?: BrandData | null

  // Current schema fields
  status: ItemStatus
  has_been_tried: boolean

  // Price tracking
  product_url?: string | null
  lowest_price_seen?: number | null
  auto_price_tracking_enabled?: boolean
  price_check_failures?: number | null
  last_price_check_at?: string | null

  // Social Sharing (Pinned to Profile)
  is_pinned?: boolean // Featured items on user's public profile

  // Color Palette (Sneaker Inspiration)
  // Supports both legacy format (string[]) and new dual-vibe format ({ bold: string[], muted: string[] })
  color_palette?: string[] | { bold: string[]; muted: string[] } | null // 5 harmonious hex colors
  primary_color?: string | null // Dominant color from image
}
