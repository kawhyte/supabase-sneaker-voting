'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { OutfitItem } from '@/components/types/outfit'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/outfit-layout-engine'

interface CanvasItemProps {
  item: OutfitItem
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onRemove: () => void
  readOnly?: boolean
}

/**
 * CanvasItem - Memoized individual draggable item on the canvas
 *
 * Key Optimizations:
 * - React.memo prevents re-renders unless props change
 * - Custom comparison function only checks relevant props
 * - useMemo for style calculations
 * - No re-render when parent updates other items
 *
 * Success Criteria:
 * - Only this item re-renders, not all items
 * - Drag remains smooth (<30ms lag)
 * - Prevents 90% of unnecessary re-renders
 */
const CanvasItem = memo(
  function CanvasItem({
    item,
    isDragging,
    onMouseDown,
    onRemove,
    readOnly = false,
  }: CanvasItemProps) {
    // Memoize position calculations
    const pixelX = item.position_x * CANVAS_WIDTH
    const pixelY = item.position_y * CANVAS_HEIGHT
    const pixelWidth = item.display_width * CANVAS_WIDTH
    const pixelHeight = item.display_height * CANVAS_HEIGHT

    // Memoize image selection with priority: cropped > main > legacy > first photo
    const imageUrl = useMemo(() => {
      // Priority 1: Cropped version (if item has been manually cropped for this outfit)
      if (item.cropped_image_url) {
        return item.cropped_image_url
      }

      // Priority 2: Main image (is_main_image flag)
      const mainPhoto = item.item?.item_photos?.find(photo => photo.is_main_image)
      if (mainPhoto) {
        return mainPhoto.image_url
      }

      // Priority 3: Legacy single image (for items created before multi-photo support)
      if (item.item?.image_url) {
        return item.item.image_url
      }

      // Priority 4: First photo (fallback if no main image designated)
      if (item.item?.item_photos?.[0]) {
        return item.item.item_photos[0].image_url
      }

      // Fallback: null (will show placeholder)
      return null
    }, [
      item.cropped_image_url,
      item.item?.image_url,
      item.item?.item_photos,
    ])

    // Memoize style object
    const itemStyle = useMemo(
      () => ({
        left: `${pixelX}px`,
        top: `${pixelY}px`,
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
        zIndex: item.z_index,
        transform: isDragging ? 'scale(1.1)' : 'scale(1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }),
      [pixelX, pixelY, pixelWidth, pixelHeight, item.z_index, isDragging]
    )

    // Memoize container classes
    const containerClasses = useMemo(
      () =>
        `absolute group cursor-grab active:cursor-grabbing transition-all ${
          isDragging ? 'scale-110 shadow-xl' : 'hover:shadow-lg'
        }`,
      [isDragging]
    )

    return (
      <div
        data-item-id={item.id}
        className={containerClasses}
        style={itemStyle}
        onMouseDown={onMouseDown}
        title="Drag to move, hover for options"
      >
        {/* Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${item.item?.brand} ${item.item?.model}`}
            fill
            className="object-contain rounded-md shadow-md"
            sizes={`${pixelWidth}px`}
            loading="lazy"
            onError={() =>
              console.error(`Failed to load image: ${imageUrl}`)
            }
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 rounded-md flex items-center justify-center text-xs text-slate-600">
            No image
          </div>
        )}

        {/* Delete Button (hover only) */}
        {!readOnly && (
          <div className="dense absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={e => {
                e.stopPropagation()
                onRemove()
              }}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:shadow-lg hover:scale-110 transition-all"
              aria-label="Remove item"
              title="Click to remove from outfit"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    )
  },
  // Custom comparison function: only re-render if these specific props change
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.position_x === nextProps.item.position_x &&
      prevProps.item.position_y === nextProps.item.position_y &&
      prevProps.item.z_index === nextProps.item.z_index &&
      prevProps.item.display_width === nextProps.item.display_width &&
      prevProps.item.display_height === nextProps.item.display_height &&
      prevProps.item.cropped_image_url ===
        nextProps.item.cropped_image_url &&
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.readOnly === nextProps.readOnly
    )
  }
)

CanvasItem.displayName = 'CanvasItem'

export { CanvasItem }
