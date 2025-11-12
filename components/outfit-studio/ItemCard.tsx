'use client'

import { memo } from 'react'
import Image from 'next/image'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface ItemCardProps {
  item: WardrobeItem
  onClick: () => void
  isDisabled?: boolean
  isInOutfit?: boolean
  disabledReason?: string
}

/**
 * ItemCard - Visual card for item selection grid
 * Features:
 * - Hover scale effect (1.05)
 * - Shows item photo
 * - Disabled state with checkmark if already in outfit
 * - Tooltip on hover with brand/model
 * - Optimized with React.memo
 */
function ItemCardComponent({ item, onClick, isDisabled = false, isInOutfit = false, disabledReason }: ItemCardProps) {
  // Get image URL (priority: main photo > legacy > first photo)
  const mainPhoto = item.item_photos?.find(photo => photo.is_main_image)
  const imageUrl = mainPhoto?.image_url || item.image_url || item.item_photos?.[0]?.image_url

  return (
    <div className="flex flex-col gap-2 group">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'relative w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg cursor-pointer transition-all duration-200 overflow-hidden',
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 hover:shadow-md active:scale-95'
        )}
        title={isDisabled ? disabledReason : `${item.brand} ${item.model}`}
        aria-label={`Add ${item.brand} ${item.model} to outfit`}
        aria-disabled={isDisabled}
      >
        {/* Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${item.brand} ${item.model}`}
            fill
            className="object-cover rounded-lg"
            sizes="100px"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-600">
            No image
          </div>
        )}

        {/* Already in Outfit Badge */}
        {isInOutfit && (
          <div className="absolute top-2 right-2 bg-sun-400 rounded-full p-1.5 shadow-md">
            <Check className="h-3 w-3 text-slate-900" aria-hidden="true" />
          </div>
        )}

        {/* Hover Overlay with Item Info */}
        {!isDisabled && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
            <div className="text-white text-xs font-medium truncate w-full">
              {item.brand} {item.model}
            </div>
          </div>
        )}
      </button>
    </div>
  )
}

export const ItemCard = memo(ItemCardComponent, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.isDisabled === next.isDisabled &&
    prev.isInOutfit === next.isInOutfit &&
    prev.disabledReason === next.disabledReason
  )
})

ItemCard.displayName = 'ItemCard'
