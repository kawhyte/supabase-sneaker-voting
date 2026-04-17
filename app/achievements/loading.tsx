import React from 'react';
import { Loader2 } from 'lucide-react';

export default function InsightsLoading() {
  return (
    <div className="flex w-full flex-col gap-8 p-6 md:p-8 animate-in fade-in duration-500">

      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-10 w-64 rounded-xl bg-gray-200/60 animate-pulse" />
        <div className="h-5 w-96 rounded-lg bg-gray-100 animate-pulse" />
      </div>

      {/* Financial Insights Glassmorphic Skeleton */}
      <div className="relative overflow-hidden rounded-[2rem] border border-gray-200/60 bg-white/40 p-6 md:p-8 shadow-sm">
        <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 h-6 w-48 rounded-lg bg-gray-200/60 animate-pulse" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl bg-white/50 border border-gray-100 p-5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gray-200/60 animate-pulse" />
                  <div className="h-4 w-24 rounded-md bg-gray-200/40 animate-pulse" />
                </div>
                <div className="h-8 w-32 rounded-lg bg-gray-200/80 animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Usage Trends) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="h-6 w-40 rounded-lg bg-gray-200/60 animate-pulse mb-2" />
          {[1, 2, 3].map((i) => (
            <div key={`trend-${i}`} className="h-24 w-full rounded-2xl border border-gray-100 bg-white/50 animate-pulse" />
          ))}
        </div>

        {/* Right Column (Rotation Goals / Lists) */}
        <div className="flex flex-col gap-4">
          <div className="h-6 w-48 rounded-lg bg-gray-200/60 animate-pulse mb-2" />
          <div className="h-[400px] w-full rounded-[2rem] border border-gray-100 bg-white/50 animate-pulse flex items-center justify-center">
             <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
          </div>
        </div>

      </div>

    </div>
  );
}
