import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfileLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-start">
        {/* Avatar Skeleton */}
        <Skeleton className="h-24 w-24 rounded-full sm:h-32 sm:w-32" />

        {/* User Info Skeleton */}
        <div className="flex flex-1 flex-col items-center gap-4 sm:items-start">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Profile Stats Skeleton */}
      <div className="flex items-center justify-center gap-8 border-y border-border py-6 sm:justify-start">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 sm:items-start"
          >
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Wishlist Grid Skeleton */}
      <div className="mt-8 py-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
