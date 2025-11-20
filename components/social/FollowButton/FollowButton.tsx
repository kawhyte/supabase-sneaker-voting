/**
 * FollowButton Component
 *
 * Instagram-style follow/unfollow button with optimistic updates
 *
 * Features:
 * - Three variants: default, compact, icon-only
 * - Optimistic UI updates with rollback on error
 * - Loading states (prevents double-clicks)
 * - Real-time follower count updates
 * - Accessible (keyboard navigation, ARIA labels)
 * - Analytics tracking support (Phase 6)
 *
 * @example
 * <FollowButton
 *   targetUserId="user-123"
 *   variant="default"
 *   source="profile"
 *   showCount
 * />
 */

'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFollowStatus } from './useFollowStatus';
import { useFollowMutation } from './useFollowMutation';
import type { FollowButtonProps } from './types';

export function FollowButton({
  targetUserId,
  variant = 'default',
  source = 'profile',
  onFollowChange,
  className,
  showCount = false,
}: FollowButtonProps) {
  // Fetch follow status
  const {
    isFollowing,
    followerCount,
    isLoading: isLoadingStatus,
    error,
    setIsFollowing,
    setFollowerCount,
  } = useFollowStatus(targetUserId);

  // Follow/unfollow mutation
  const { toggleFollow, isLoading: isLoadingMutation } = useFollowMutation({
    targetUserId,
    isFollowing,
    followerCount,
    setIsFollowing,
    setFollowerCount,
    onFollowChange,
    source,
  });

  const isLoading = isLoadingStatus || isLoadingMutation;

  // Error state
  if (error) {
    return null; // Silently fail for better UX
  }

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <Button
        onClick={toggleFollow}
        disabled={isLoading}
        variant={isFollowing ? 'outline' : 'default'}
        size="icon"
        className={cn(
          'h-9 w-9 transition-all motion-safe:duration-150',
          className
        )}
        aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
        aria-pressed={isFollowing}
      >
        {isFollowing ? (
          <UserCheck className="h-4 w-4" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
      </Button>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Button
        onClick={toggleFollow}
        disabled={isLoading}
        variant={isFollowing ? 'outline' : 'default'}
        size="sm"
        className={cn(
          'h-8 gap-2 transition-all motion-safe:duration-150',
          className
        )}
        aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
        aria-pressed={isFollowing}
      >
        {isFollowing ? (
          <>
            <UserCheck className="h-3 w-3" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="h-3 w-3" />
            Follow
          </>
        )}
        {showCount && followerCount > 0 && (
          <span className="text-xs text-muted-foreground">
            ({followerCount})
          </span>
        )}
      </Button>
    );
  }

  // Default variant
  return (
    <Button
      onClick={toggleFollow}
      disabled={isLoading}
      variant={isFollowing ? 'outline' : 'default'}
      size="default"
      className={cn(
        'gap-2 transition-all motion-safe:duration-150',
        isFollowing && 'hover:bg-destructive hover:text-destructive-foreground hover:border-destructive',
        className
      )}
      aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
      aria-pressed={isFollowing}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Following</span>
          <span className="sm:hidden">Following</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Follow</span>
          <span className="sm:hidden">Follow</span>
        </>
      )}
      {showCount && followerCount > 0 && (
        <span className="text-sm text-muted-foreground">
          ({followerCount})
        </span>
      )}
    </Button>
  );
}
