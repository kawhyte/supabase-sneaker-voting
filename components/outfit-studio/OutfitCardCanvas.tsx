'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import { OutfitWithItems } from '@/components/types/outfit'
import {
  prepareOutfitForCard,
  CARD_CANVAS_WIDTH,
  CARD_CANVAS_HEIGHT
} from '@/lib/card-layout-engine'
import { getStandardizedImageUrl } from '@/lib/image-standardization'

interface OutfitCardCanvasProps {
  outfit: OutfitWithItems
  className?: string
}

/**
 * Client-side canvas renderer for outfit card preview
 * Renders 400×480px flat-lay with standardized item positions
 */
export function OutfitCardCanvas({
  outfit,
  className = ''
}: OutfitCardCanvasProps) {
  const { items, backgroundColor } = useMemo(
    () => prepareOutfitForCard(outfit),
    [outfit]
  )

  if (items.length === 0) {
    return (
      <div
        className={`relative w-full aspect-[5/6] rounded-lg flex items-center justify-center bg-slate-100 ${className}`}
        style={{ backgroundColor }}
      >
        <span className="text-sm text-slate-400">No items</span>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full aspect-[5/6] rounded-lg overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      {/* Render items in z-index order */}
      {items.map(item => {
        // Denormalize positions to pixels
        const pixelX = item.position_x * CARD_CANVAS_WIDTH
        const pixelY = item.position_y * CARD_CANVAS_HEIGHT
        const pixelWidth = item.display_width * CARD_CANVAS_WIDTH
        const pixelHeight = item.display_height * CARD_CANVAS_HEIGHT

        // Get image source (prefer cropped, fallback to original)
        const imageUrl =
          item.cropped_image_url ||
          item.item?.image_url ||
          item.item?.item_photos?.[0]?.image_url

        if (!imageUrl) return null

        // Apply standardization transformation (FREE tier)
        const standardizedUrl = getStandardizedImageUrl(
          imageUrl,
          item.item?.category || 'other'
        )

        return (
          <div
            key={item.id}
            className="absolute"
            style={{
              left: `${(pixelX / CARD_CANVAS_WIDTH) * 100}%`,
              top: `${(pixelY / CARD_CANVAS_HEIGHT) * 100}%`,
              width: `${(pixelWidth / CARD_CANVAS_WIDTH) * 100}%`,
              height: `${(pixelHeight / CARD_CANVAS_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: item.z_index || 0
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={standardizedUrl}
                alt={`${item.item?.brand} ${item.item?.model}`}
                fill
                sizes={`${pixelWidth}px`}
                className="object-contain drop-shadow-md"
                quality={85}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
