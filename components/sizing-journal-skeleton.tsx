'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SizingJournalSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md sm:gap-lg lg:gap-lg">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden flex flex-col rounded-xl w-full">
          {/* Image Skeleton - aspect-[4/3] to match actual cards */}
          <div className="relative w-full aspect-[4/3] bg-gray-200 animate-pulse" />

          {/* Content Section - matches actual card padding and structure */}
          <CardContent className="flex-1 p-md flex flex-col gap-xs">
            {/* Brand */}
            <Skeleton className="h-3 w-1/4" />

            {/* Title - 2 lines */}
            <div className="mt-xs">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            {/* Metadata Grid - Size, Fit, Comfort */}
            <div className="grid grid-cols-3 gap-xs mt-md">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>
            </div>

            {/* Notes Section */}
            <Skeleton className="h-16 w-full mt-md rounded-lg" />

            {/* Footer Badges */}
            <div className="flex gap-xs mt-auto pt-md border-t border-gray-100">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
