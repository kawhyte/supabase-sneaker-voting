'use client'

import { useState } from 'react'
import { ChevronDown, Footprints } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { cn } from '@/lib/utils'

function getCarouselImage(item: WardrobeItem): string {
  const mainPhoto = item.item_photos?.find(p => p.is_main_image)
  if (mainPhoto?.image_url) return mainPhoto.image_url
  const firstPhoto = item.item_photos?.[0]
  if (firstPhoto?.image_url) return firstPhoto.image_url
  return item.image_url ?? '/placeholder.jpg'
}

interface SneakerSelectorDrawerProps {
  items: WardrobeItem[]
  selectedItemId: string | null
  selectedItem: WardrobeItem | null
  onSelect: (id: string) => void
}

export function SneakerSelectorDrawer({
  items,
  selectedItemId,
  selectedItem,
  onSelect,
}: SneakerSelectorDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (id: string) => {
    onSelect(id)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border bg-card text-left"
          aria-label="Select a sneaker"
        >
          {selectedItem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getCarouselImage(selectedItem)}
              alt={`${selectedItem.brand} ${selectedItem.model}`}
              className="h-12 w-12 object-contain rounded-xl bg-muted shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Footprints className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <span className="flex-1 text-sm font-medium text-foreground">
            {selectedItem
              ? `${selectedItem.brand} ${selectedItem.model}`
              : 'Select a Sneaker'}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[80dvh] rounded-t-3xl px-0 pb-0">
        <SheetHeader className="px-5 pb-3 border-b border-border">
          <SheetTitle className="text-base font-semibold">
            Your Rotation
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {items.length} pairs
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto">
          <div className="grid grid-cols-3 gap-3 p-4">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="flex flex-col items-center gap-1.5 focus-visible:outline-none"
                aria-label={`Select ${item.brand} ${item.model}`}
              >
                <div
                  className={cn(
                    'w-full aspect-square rounded-2xl bg-card overflow-hidden ring-offset-background transition-all duration-150',
                    item.id === selectedItemId
                      ? 'ring-2 ring-offset-2 ring-[var(--color-sun-400)]'
                      : 'ring-1 ring-transparent hover:ring-border'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCarouselImage(item)}
                    alt={`${item.brand} ${item.model}`}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground w-full text-center truncate leading-tight">
                  {item.brand}
                </span>
              </button>
            ))}
          </div>
          {/* safe-area bottom padding for notched phones */}
          <div className="h-[env(safe-area-inset-bottom,16px)]" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
