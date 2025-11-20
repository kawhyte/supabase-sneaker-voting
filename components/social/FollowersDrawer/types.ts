/**
 * Types for FollowersDrawer component
 */

export interface UserListItem {
  id: string
  display_name: string
  avatar_url: string | null
  is_following: boolean
  followed_at: string
  is_self: boolean
}

export type DrawerMode = 'followers' | 'following'

export interface FollowersDrawerProps {
  /** Whether the drawer is open */
  open: boolean
  /** Callback when drawer should close */
  onOpenChange: (open: boolean) => void
  /** User ID to show followers/following for */
  userId: string
  /** Mode: show followers or following */
  mode: DrawerMode
  /** Initial follower/following count (for optimization) */
  initialCount?: number
}

export interface FollowersListResponse {
  followers?: UserListItem[]
  following?: UserListItem[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}
