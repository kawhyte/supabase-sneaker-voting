'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * SkeletonCard - Matches WardrobeItemCard loading state
 * Used for skeleton loaders across dashboard, collection, and archive views
 */
export default function SkeletonCard() {
  return (
    <Card className="overflow-hidden flex flex-col rounded-xl w-full min-h-[420px] border border-stone-200 shadow-sm">
      {/* Actions Menu Placeholder */}
      <div className="absolute top-2 right-2 z-40 h-8 w-8" />

      {/* Image Section - matches aspect ratio of photo carousel */}
      <div className="relative w-full bg-stone-100 animate-pulse" style={{ aspectRatio: '3/4' }} />

      {/* Content Section */}
      <CardContent className="flex-1 p-4 flex flex-col gap-3">
        {/* Brand with Logo */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded flex-shrink-0" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Title (Model + Color) */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Metadata Section */}
        <div className="flex flex-col gap-2.5 mt-3">
          {/* Date */}
          <Skeleton className="h-4 w-3/4" />

          {/* Pricing */}
          <Skeleton className="h-4 w-1/2" />

          {/* Size, Comfort, Wears */}
          <div className="flex gap-3">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>

          {/* Store and Last Worn */}
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Notes Section */}
        <div className="mt-3 p-2.5 bg-stone-50 rounded-lg">
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>

        {/* Footer */}
        <div className="flex gap-2 mt-auto pt-4 border-t border-stone-200">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}