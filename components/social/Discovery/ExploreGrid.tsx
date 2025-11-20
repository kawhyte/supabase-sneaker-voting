'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserPreviewCard } from './UserPreviewCard';
import { EmptyExplore } from './EmptyExplore';
import { ExploreUser, ExploreResponse } from './types';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export function ExploreGrid() {
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const observerRef = useRef<IntersectionObserver>();
  const lastUserRef = useRef<HTMLDivElement>(null);

  // Fetch users function
  const fetchUsers = useCallback(async (currentOffset: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `/api/social/explore?limit=${ITEMS_PER_PAGE}&offset=${currentOffset}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: ExploreResponse = await response.json();

      if (append) {
        setUsers((prev) => [...prev, ...data.users]);
      } else {
        setUsers(data.users);
      }

      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      console.error('Error fetching explore users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUsers(0, false);
  }, [fetchUsers]);

  // Infinite scroll - load more when last user is visible
  useEffect(() => {
    if (loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const newOffset = offset + ITEMS_PER_PAGE;
          setOffset(newOffset);
          fetchUsers(newOffset, true);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (lastUserRef.current) {
      observer.observe(lastUserRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, offset, fetchUsers]);

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-[320px] bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => fetchUsers(0, false)}
          className="mt-4 px-4 py-2 bg-sun-400 text-slate-900 rounded-lg hover:bg-sun-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return <EmptyExplore />;
  }

  // Grid with infinite scroll
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user, index) => (
          <div
            key={user.user_id}
            ref={index === users.length - 1 ? lastUserRef : null}
          >
            <UserPreviewCard user={user} />
          </div>
        ))}
      </div>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-sun-400" />
        </div>
      )}

      {/* End of results message */}
      {!hasMore && users.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          You&apos;ve reached the end of the list
        </div>
      )}
    </div>
  );
}
