'use client';

import { Card } from '@/components/ui/card';
import { Users, Sparkles } from 'lucide-react';

export function EmptyExplore() {
  return (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
        {/* Icon */}
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-sun-400/10 flex items-center justify-center">
            <Users className="h-10 w-10 text-sun-400" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-6 w-6 text-sun-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            No Public Wishlists Yet
          </h3>
          <p className="text-muted-foreground">
            Be the first to share your wishlist with the community! Update your privacy
            settings to make your wishlist public.
          </p>
        </div>

        {/* Tip */}
        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Tip:</p>
          <p>
            To share your wishlist, go to Settings → Privacy and change your wishlist
            privacy to &quot;Public&quot; or &quot;Followers Only&quot;.
          </p>
        </div>
      </div>
    </Card>
  );
}
