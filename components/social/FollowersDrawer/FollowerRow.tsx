'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FollowButton } from '@/components/social/FollowButton'
import Link from 'next/link'
import type { UserListItem } from './types'

interface FollowerRowProps {
  user: UserListItem
}

/**
 * Single row in followers/following list
 * Shows user avatar, name, and follow button
 */
export function FollowerRow({ user }: FollowerRowProps) {
  const initials = user.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center justify-between gap-4 p-4 hover:bg-accent/50 transition-colors rounded-lg">
      {/* Avatar + Name (clickable to profile) */}
      <Link
        href={`/users/${user.id}`}
        className="flex items-center gap-3 flex-1 min-w-0 group"
      >
        <Avatar className="h-10 w-10 ring-2 ring-background group-hover:ring-sun-400/50 transition-all">
          <AvatarImage
            src={user.avatar_url || undefined}
            alt={user.display_name}
          />
          <AvatarFallback className="bg-sun-400/10 text-sun-400 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground group-hover:text-sun-400 transition-colors truncate">
            {user.display_name}
          </p>
        </div>
      </Link>

      {/* Follow Button (hide if viewing own profile) */}
      {!user.is_self && (
        <div className="flex-shrink-0">
          <FollowButton
            targetUserId={user.id}
            variant="compact"
            source="modal"
          />
        </div>
      )}
    </div>
  )
}
