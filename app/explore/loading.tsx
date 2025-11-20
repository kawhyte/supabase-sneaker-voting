import { Sparkles } from 'lucide-react';

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-sun-400" />
            <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-6 w-96 bg-muted animate-pulse rounded" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[320px] bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
