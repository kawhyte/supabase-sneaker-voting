'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function WardrobeSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="overflow-hidden">
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="flex flex-col space-y-3 p-4">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/5" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-center w-full">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}
