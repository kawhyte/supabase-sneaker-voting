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
