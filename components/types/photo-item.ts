/**
 * ✅ PHOTO ITEM TYPE - Unified Interface for Photo Management
 *
 * 🎯 PURPOSE:
 * Single source of truth for photo item structure used across:
 * - AddItemForm (create & edit modes)
 * - MultiPhotoUpload (drag-drop, reorder, delete)
 * - EditItemModal (edit mode specific)
 *
 * 📦 PROPERTIES:
 * - id: Unique identifier (new photos use timestamp-based, existing use DB id)
 * - file: File object (empty for existing photos)
 * - preview: Base64 or blob URL for display
 * - isMain: Whether this is the main/cover image
 * - order: Sequential order in gallery (1-based)
 * - isExisting: Whether this photo is from database (not newly uploaded)
 * - cloudinaryId?: Cloudinary ID for existing photos (for deletion)
 */

export interface PhotoItem {
  id: string
  file: File
  preview: string
  isMain: boolean
  order: number
  isExisting?: boolean
  cloudinaryId?: string
}
