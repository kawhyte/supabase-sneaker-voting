/**
 * FollowButton Types
 *
 * Type definitions for the FollowButton component and related hooks
 */

/**
 * Follow status response from API
 */
export interface FollowStatusResponse {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

/**
 * Follow/unfollow mutation response
 */
export interface FollowMutationResponse {
  success: boolean;
  isFollowing: boolean;
  followerCount: number;
  message: string;
  error?: string; // Error message if request failed
}

/**
 * Follow button variant styles
 * - default: Full button with text (e.g., "Follow" / "Following")
 * - compact: Smaller button with text
 * - icon-only: Icon button (user-plus icon)
 */
export type FollowButtonVariant = 'default' | 'compact' | 'icon-only';

/**
 * Source of the follow action (for analytics tracking)
 */
export type FollowActionSource = 'profile' | 'explore' | 'modal' | 'search';

/**
 * FollowButton component props
 */
export interface FollowButtonProps {
  /** Target user ID to follow/unfollow */
  targetUserId: string;

  /** Button variant style */
  variant?: FollowButtonVariant;

  /** Source for analytics tracking */
  source?: FollowActionSource;

  /** Optional callback when follow state changes */
  onFollowChange?: (isFollowing: boolean) => void;

  /** Additional CSS classes */
  className?: string;

  /** Show follower count inline (default: false) */
  showCount?: boolean;
}
