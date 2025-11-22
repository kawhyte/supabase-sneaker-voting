'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDensity, getDensityImageAspect } from '@/lib/view-density-context'

interface WardrobeSkeletonProps {
  viewMode?: 'collection' | 'wishlist' | 'archive'
  count?: number
}

export function WardrobeSkeleton({ viewMode = 'collection', count = 6 }: WardrobeSkeletonProps = {}) {
  const { density } = useDensity()

  // Compute display logic based on density
  const showDates = density === 'detailed'
  const showNotes = density !== 'list' // List view shows notes in expansion
  const showStore = density !== 'list' // List view shows store in expansion

  // Get dynamic aspect ratio based on density
  const aspectRatio = getDensityImageAspect(density)
  const aspectRatioValue = aspectRatio === 'square' ? '1/1' : aspectRatio === 'portrait' ? '3/4' : '4/3'
  return (
    <div className={`grid ${
      density === 'comfortable' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4' :
      density === 'detailed' ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6' :
      '' // List view doesn't use skeleton (renders list items)
    }`}>
      {[...Array(count)].map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden flex flex-col rounded-xl w-full min-h-[420px] border border-stone-200 shadow-sm"
        >
          {/* Actions Menu Placeholder */}
          <div className="absolute top-2 right-2 z-40 h-8 w-8" />

          {/* Image Section - matches aspect ratio of photo carousel */}
          <div
            className="relative w-full bg-stone-100 animate-pulse"
            style={{ aspectRatio: aspectRatioValue }}
            aria-label="Loading image"
          />

          {/* Content Section */}
          <CardContent className="flex-1 p-4 flex flex-col gap-3">
            {/* Brand with Logo */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded flex-shrink-0 animate-pulse" />
              <Skeleton className="h-3 w-20 animate-pulse" />
            </div>

            {/* Archive Reason - Archive view only */}
            {viewMode === 'archive' && (
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded animate-pulse" />
                <Skeleton className="h-3 w-24 animate-pulse" />
              </div>
            )}

            {/* Title (Model + Color) */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full animate-pulse" />
              <Skeleton className="h-4 w-2/3 animate-pulse" />
            </div>

            {/* Metadata Section */}
            <div className="flex flex-col gap-2.5 mt-3">
              {/* Date - Only show in detailed mode */}
              {showDates && <Skeleton className="h-4 w-3/4 animate-pulse" />}

              {/* Pricing */}
              <Skeleton className="h-4 w-1/2 animate-pulse" />

              {/* Size, Comfort, Wears */}
              <div className="flex gap-3">
                <Skeleton className="h-5 w-16 rounded animate-pulse" />
                <Skeleton className="h-5 w-16 rounded animate-pulse" />
                <Skeleton className="h-5 w-16 rounded animate-pulse" />
              </div>

              {/* Store and Last Worn - Only show if not compact */}
              {showStore && <Skeleton className="h-4 w-2/3 animate-pulse" />}
            </div>

            {/* Cooling-Off Badge - Only for wishlist items */}
            {viewMode === 'wishlist' && (
              <div className="mt-2">
                <Skeleton className="h-6 w-32 rounded-md animate-pulse" />
              </div>
            )}

            {/* Notes Section - Only show if not compact */}
            {showNotes && (
              <div className="mt-3 p-2.5 bg-stone-50 rounded-lg">
                <Skeleton className="h-12 w-full animate-pulse" />
              </div>
            )}

            {/* Status Badges - Conditional based on view mode */}
            <div className="flex gap-2 mt-3">
              {viewMode === 'archive' ? (
                <>
                  <Skeleton className="h-5 w-20 rounded-md animate-pulse" />
                  <Skeleton className="h-5 w-24 rounded-md animate-pulse" />
                </>
              ) : viewMode === 'wishlist' ? (
                <Skeleton className="h-5 w-20 rounded-md animate-pulse" />
              ) : null}
            </div>

            {/* Footer - Outfit Creation & Cost Per Wear Button */}
            <div className="flex gap-2 mt-auto pt-4 border-t border-stone-200">
              {viewMode !== 'archive' && (
                <Skeleton className="h-8 w-28 rounded-md animate-pulse" />
              )}
              {viewMode === 'collection' && (
                <Skeleton className="h-8 w-32 rounded-md animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
