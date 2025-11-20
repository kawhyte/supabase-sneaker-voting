import { Metadata } from 'next';
import { ExploreGrid } from '@/components/social/Discovery';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Wishlists | PurrView',
  description: 'Discover and follow public wishlists from the PurrView community',
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-sun-400" />
            <h1 className="text-3xl font-bold text-foreground">
              Explore Wishlists
            </h1>
          </div>
          <p className="text-muted-foreground">
            Discover what others are wishlisting and get inspired for your next purchase
          </p>
        </div>

        {/* Explore Grid */}
        <ExploreGrid />
      </div>
    </div>
  );
}
