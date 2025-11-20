'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { FollowButton } from '@/components/social/FollowButton';
import { ExploreUser } from './types';
import { Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

interface UserPreviewCardProps {
  user: ExploreUser;
}

export function UserPreviewCard({ user }: UserPreviewCardProps) {
  const displayName = user.display_name || user.username || 'Anonymous';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleCardClick = () => {
    trackEvent(AnalyticsEvent.EXPLORE_USER_CARD_CLICKED, {
      target_user_id: user.user_id,
      follower_count: user.follower_count,
      preview_item_count: user.preview_items.length,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header: Avatar + Name + Follow Button */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href={`/users/${user.user_id}`} onClick={handleCardClick}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-sun-400 text-slate-900">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/users/${user.user_id}`} onClick={handleCardClick}>
              <h3 className="font-semibold text-base truncate hover:text-sun-400 transition-colors">
                {displayName}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {user.follower_count} {user.follower_count === 1 ? 'follower' : 'followers'}
            </p>
          </div>

          <FollowButton
            targetUserId={user.user_id}
            variant="compact"
            source="explore"
          />
        </div>
      </div>

      {/* Preview Items Grid */}
      <Link href={`/users/${user.user_id}`} onClick={handleCardClick}>
        <div className="p-4">
          {user.preview_items.length === 0 ? (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
              No wishlist items yet
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {user.preview_items.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className="aspect-square bg-muted rounded-lg overflow-hidden relative group"
                >
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url}
                      alt={`${item.brand} ${item.model}`.trim() || 'Wishlist item'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                      {item.brand && item.model ? `${item.brand} ${item.model}` : 'No photo'}
                    </div>
                  )}

                  {/* Overlay with brand/model on hover */}
                  {item.photo_url && (item.brand || item.model) && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                      <p className="text-white text-xs font-medium line-clamp-2">
                        {[item.brand, item.model].filter(Boolean).join(' ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Fill empty slots if less than 4 items */}
              {Array.from({ length: Math.max(0, 4 - user.preview_items.length) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center"
                >
                  <span className="text-xs text-muted-foreground">Empty</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
