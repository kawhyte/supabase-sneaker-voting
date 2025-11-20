/**
 * useFollowMutation Hook
 *
 * Handles follow/unfollow mutations with optimistic updates
 * - Optimistic UI updates (instant feedback)
 * - Automatic rollback on error
 * - Loading state management
 * - Toast notifications
 * - Analytics tracking (optional)
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { FollowActionSource, FollowMutationResponse } from './types';

interface UseFollowMutationParams {
  targetUserId: string;
  isFollowing: boolean;
  followerCount: number;
  setIsFollowing: (value: boolean) => void;
  setFollowerCount: (value: number) => void;
  onFollowChange?: (isFollowing: boolean) => void;
  source?: FollowActionSource;
}

interface UseFollowMutationReturn {
  toggleFollow: () => Promise<void>;
  isLoading: boolean;
}

export function useFollowMutation({
  targetUserId,
  isFollowing,
  followerCount,
  setIsFollowing,
  setFollowerCount,
  onFollowChange,
  source = 'profile',
}: UseFollowMutationParams): UseFollowMutationReturn {
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async () => {
    // Prevent double-clicks
    if (isLoading) return;

    const previousFollowState = isFollowing;
    const previousFollowerCount = followerCount;

    try {
      setIsLoading(true);

      // Optimistic update
      const newFollowState = !isFollowing;
      const newFollowerCount = newFollowState
        ? followerCount + 1
        : Math.max(followerCount - 1, 0);

      setIsFollowing(newFollowState);
      setFollowerCount(newFollowerCount);

      // Call appropriate API endpoint
      const endpoint = newFollowState
        ? '/api/social/follow'
        : `/api/social/unfollow/${targetUserId}`;

      const method = newFollowState ? 'POST' : 'DELETE';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: newFollowState ? JSON.stringify({ targetUserId }) : undefined,
      });

      const data: FollowMutationResponse = await response.json();

      if (!response.ok) {
        // Rollback optimistic update
        setIsFollowing(previousFollowState);
        setFollowerCount(previousFollowerCount);

        toast.error(data.error || 'Failed to update follow status', {
          duration: 4000,
        });
        return;
      }

      // Update with actual server values
      setIsFollowing(data.isFollowing);
      setFollowerCount(data.followerCount);

      // Success toast
      toast.success(data.message, {
        duration: 3000,
      });

      // Callback
      onFollowChange?.(data.isFollowing);

      // Analytics tracking (optional - can be implemented later in Phase 6)
      // trackFollowEvent(newFollowState ? 'follow_user' : 'unfollow_user', {
      //   target_user_id: targetUserId,
      //   source,
      // });

    } catch (error) {
      console.error('Error toggling follow:', error);

      // Rollback optimistic update
      setIsFollowing(previousFollowState);
      setFollowerCount(previousFollowerCount);

      toast.error('Network error. Please try again.', {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleFollow,
    isLoading,
  };
}
