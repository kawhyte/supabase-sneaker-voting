import { Metadata } from 'next';
import { ExploreGrid } from '@/components/social/Discovery';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Discover Collectors | PurrView',
  description: 'Browse sneaker collections from the PurrView community',
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Discover Collectors
            </h1>
          </div>
          <p className="text-muted-foreground">
            Browse sneaker collections from the PurrView community
          </p>
        </div>

        {/* Explore Grid */}
        <ExploreGrid />
      </div>
    </div>
  );
}
