import type { ItemCategory, SizeType } from "./item-category";

export interface ItemPhoto {
  id: string
  image_url: string
  image_order: number
  is_main_image: boolean
}

export type ArchiveReason = 'sold' | 'donated' | 'worn_out' | 'other'

export interface SizingJournalEntry {
  id: string
  created_at: string
  user_name: string
  brand: string
  model: string
  color: string
  category: ItemCategory
  size_type: SizeType
  size_tried: string | null
  fit_rating: number | null
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

  // Current schema fields
  status: 'owned' | 'wishlisted' | 'journaled'
  has_been_tried: boolean
}

export interface FitRating {
  value: number
  label: string
  icon: string
  color: string
}

export const FIT_RATINGS: FitRating[] = [
  { value: 1, label: 'Too Small', icon: '🔴', color: 'bg-red-100 text-red-800' },
  { value: 2, label: 'Snug', icon: '🟠', color: 'bg-orange-100 text-orange-800' },
  { value: 3, label: 'Perfect', icon: '🟢', color: 'bg-green-100 text-green-800' },
  { value: 4, label: 'Loose', icon: '🟡', color: 'bg-yellow-100 text-yellow-800' },
  { value: 5, label: 'Too Big', icon: '🔴', color: 'bg-red-100 text-red-800' }
]
