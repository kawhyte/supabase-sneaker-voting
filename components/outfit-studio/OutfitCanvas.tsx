'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import { OutfitItem } from '@/components/types/outfit'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  normalizePosition,
  denormalizePosition,
  sortByZIndex,
} from '@/lib/outfit-layout-engine'

interface OutfitCanvasProps {
  items: OutfitItem[]
  backgroundColor: string
  onUpdateItemPosition: (itemId: string, positionX: number, positionY: number) => void
  onRemoveItem: (itemId: string) => void
  onResetAutoArrange: () => void
  readOnly?: boolean
}

/**
 * OutfitCanvas - Phone mockup with draggable items
 * Visual representation of outfit on iPhone screen mockup (375×667px)
 */
export function OutfitCanvas({
  items,
  backgroundColor,
  onUpdateItemPosition,
  onRemoveItem,
  onResetAutoArrange,
  readOnly = false,
}: OutfitCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    if (readOnly) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const itemX = item.position_x * CANVAS_WIDTH
    const itemY = item.position_y * CANVAS_HEIGHT
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setDraggingItemId(itemId)
    setDragOffset({
      x: mouseX - itemX,
      y: mouseY - itemY,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingItemId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y

    const { x: normalizedX, y: normalizedY } = normalizePosition(x, y)
    onUpdateItemPosition(draggingItemId, normalizedX, normalizedY)
  }

  const handleMouseUp = () => {
    setDraggingItemId(null)
  }

  // Sort items by z-index for proper rendering
  const sortedItems = sortByZIndex(items)

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Canvas Container - Responsive */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative mx-auto select-none max-w-full"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          maxWidth: '100%',
          aspectRatio: '375 / 667',
          backgroundColor,
          border: '6px solid #000',
          borderRadius: '30px',
          overflow: 'hidden',
          cursor: draggingItemId ? 'grabbing' : 'grab',
        }}
      >
        {/* iPhone notch (visual only) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 bg-black"
          style={{
            width: '150px',
            height: '28px',
            borderRadius: '0 0 20px 20px',
            zIndex: 100,
          }}
        />

        {/* Outfit Items */}
        {sortedItems.map(item => (
          <OutfitCanvasItem
            key={item.id}
            item={item}
            isDragging={draggingItemId === item.id}
            onMouseDown={e => handleMouseDown(e, item.id)}
            onRemove={() => onRemoveItem(item.id)}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Controls */}
      {!readOnly && (
        <div className="flex gap-2 justify-center px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetAutoArrange}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
          >
            <RotateCcw className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="hidden sm:inline">Reset Auto-Arrange</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-400 text-sm text-center">Add items to create outfit</p>
        </div>
      )}
    </div>
  )
}

interface OutfitCanvasItemProps {
  item: OutfitItem
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onRemove: () => void
  readOnly?: boolean
}

/**
 * OutfitCanvasItem - Individual draggable item on the canvas
 */
function OutfitCanvasItem({
  item,
  isDragging,
  onMouseDown,
  onRemove,
  readOnly = false,
}: OutfitCanvasItemProps) {
  const pixelX = item.position_x * CANVAS_WIDTH
  const pixelY = item.position_y * CANVAS_HEIGHT
  const pixelWidth = item.display_width * CANVAS_WIDTH
  const pixelHeight = item.display_height * CANVAS_HEIGHT

  // Use cropped image if available, otherwise use original
  const imageUrl = item.cropped_image_url || item.item?.image_url || item.item?.item_photos?.[0]?.image_url

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`OutfitCanvasItem ${item.item?.brand} ${item.item?.model}:`, {
      cropped_image_url: item.cropped_image_url,
      image_url: item.item?.image_url,
      item_photos_count: item.item?.item_photos?.length || 0,
      first_photo_url: item.item?.item_photos?.[0]?.image_url,
      final_imageUrl: imageUrl,
    })
  }

  return (
    <div
      className={`absolute group transition-transform ${isDragging ? 'scale-105' : ''}`}
      style={{
        left: `${pixelX}px`,
        top: `${pixelY}px`,
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
        zIndex: item.z_index,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseDown={onMouseDown}
    >
      {/* Image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${item.item?.brand} ${item.item?.model}`}
          fill
          className="object-contain rounded-md shadow-md"
          sizes={`${pixelWidth}px`}
          onError={() => console.error(`Failed to load image: ${imageUrl}`)}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-200 rounded-md flex items-center justify-center text-xs text-slate-600">
          No image
        </div>
      )}

      {/* Delete Button (hover only) */}
      {!readOnly && (
        <button
          onClick={e => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
          aria-label="Remove item"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
