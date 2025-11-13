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

  // Phase 3: Smart Purchase Prevention
  // Cooling-off period
  cooling_off_days?: number
  can_purchase_after?: string | null
  // Price tracking
  product_url?: string | null
  lowest_price_seen?: number | null
  auto_price_tracking_enabled?: boolean
  price_check_failures?: number | null
  last_price_check_at?: string | null
}
