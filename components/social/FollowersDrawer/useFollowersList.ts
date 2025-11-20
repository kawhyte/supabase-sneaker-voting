import { useState, useEffect, useCallback } from 'react'
import type { UserListItem, DrawerMode, FollowersListResponse } from './types'

interface UseFollowersListOptions {
  userId: string
  mode: DrawerMode
  enabled: boolean
}

interface UseFollowersListReturn {
  users: UserListItem[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  total: number
}

/**
 * Hook for fetching and paginating followers/following lists
 * Supports infinite scroll and real-time updates
 */
export function useFollowersList({
  userId,
  mode,
  enabled,
}: UseFollowersListOptions): UseFollowersListReturn {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  const LIMIT = 20

  // Fetch users (followers or following)
  const fetchUsers = useCallback(
    async (newOffset: number, append = false) => {
      if (!enabled || !userId) return

      setIsLoading(true)
      setError(null)

      try {
        const endpoint = mode === 'followers' ? '/api/social/followers' : '/api/social/following'
        const params = new URLSearchParams({
          userId,
          limit: String(LIMIT),
          offset: String(newOffset),
        })

        const response = await fetch(`${endpoint}?${params}`)

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const data: FollowersListResponse = await response.json()

        const newUsers = mode === 'followers' ? data.followers || [] : data.following || []

        if (append) {
          setUsers((prev) => [...prev, ...newUsers])
        } else {
          setUsers(newUsers)
        }

        setHasMore(data.hasMore)
        setTotal(data.total)
        setOffset(newOffset)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setIsLoading(false)
      }
    },
    [userId, mode, enabled]
  )

  // Load more users (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await fetchUsers(offset + LIMIT, true)
  }, [hasMore, isLoading, offset, fetchUsers])

  // Refresh from beginning
  const refresh = useCallback(async () => {
    setOffset(0)
    setUsers([])
    setHasMore(true)
    await fetchUsers(0, false)
  }, [fetchUsers])

  // Initial load
  useEffect(() => {
    if (enabled && userId) {
      refresh()
    }
  }, [userId, mode, enabled, refresh])

  // Update a single user's follow status (for optimistic updates)
  const updateUserFollowStatus = useCallback((targetUserId: string, isFollowing: boolean) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === targetUserId ? { ...user, is_following: isFollowing } : user
      )
    )
  }, [])

  return {
    users,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
  }
}
