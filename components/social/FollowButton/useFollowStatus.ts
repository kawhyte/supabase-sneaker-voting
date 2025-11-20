/**
 * useFollowStatus Hook
 *
 * Fetches and manages follow status for a target user
 * - Loads initial follow state from API
 * - Provides loading and error states
 * - Allows manual state updates for optimistic UI
 */

'use client';

import { useState, useEffect } from 'react';
import type { FollowStatusResponse } from './types';

interface UseFollowStatusReturn {
  isFollowing: boolean;
  followerCount: number;
  isLoading: boolean;
  error: string | null;
  setIsFollowing: (value: boolean) => void;
  setFollowerCount: (value: number) => void;
  refetch: () => Promise<void>;
}

export function useFollowStatus(targetUserId: string): UseFollowStatusReturn {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/social/follow-status/${targetUserId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch follow status');
      }

      const data: FollowStatusResponse = await response.json();

      setIsFollowing(data.isFollowing);
      setFollowerCount(data.followerCount);
    } catch (err) {
      console.error('Error fetching follow status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchFollowStatus();
    }
  }, [targetUserId]);

  return {
    isFollowing,
    followerCount,
    isLoading,
    error,
    setIsFollowing,
    setFollowerCount,
    refetch: fetchFollowStatus,
  };
}
