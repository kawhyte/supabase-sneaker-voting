import { Skeleton } from '@/components/ui/skeleton'

export function HeroSkeleton() {
  return (
    <div className="mb-12">
      <Skeleton className="h-12 w-96 mx-auto mb-3" />
      <Skeleton className="h-6 w-64 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function CoreStatsSkeleton() {
  return (
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function TopWornListSkeleton() {
  return (
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function LeastWornListSkeleton() {
  return (
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-8">
      {/* Top Worn Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-8 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Items Needing Love Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      <Skeleton className="h-96 rounded-lg" />
      <Skeleton className="h-96 rounded-lg" />
    </div>
  )
}

export function FinancialInsightsSkeleton() {
  return (
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function FactsSkeleton() {
  return (
    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <HeroSkeleton />
      <CoreStatsSkeleton />
      <TopWornListSkeleton />
      <LeastWornListSkeleton />
      <FinancialInsightsSkeleton />
      <GallerySkeleton />
      <FactsSkeleton />
    </div>
  )
}
