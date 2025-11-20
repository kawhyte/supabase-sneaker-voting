'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { FollowerRow } from './FollowerRow'
import { useFollowersList } from './useFollowersList'
import type { FollowersDrawerProps, UserListItem } from './types'

/**
 * Responsive followers/following drawer
 * Modal on desktop (>1024px), drawer on mobile
 * Supports infinite scroll and search
 */
export function FollowersDrawer({
  open,
  onOpenChange,
  userId,
  mode,
  initialCount = 0,
}: FollowersDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch users with infinite scroll
  const { users, isLoading, error, hasMore, loadMore, total } = useFollowersList({
    userId,
    mode,
    enabled: open,
  })

  // Filter users by search query (client-side)
  const filteredUsers = users.filter((user) =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Intersection observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!observerTarget.current || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)

    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  // Reset search on close
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
    }
  }, [open])

  const title = mode === 'followers' ? 'Followers' : 'Following'

  const content = (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="px-6 pb-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Count Display */}
      <div className="px-6 pb-2 text-sm text-muted-foreground">
        {total > 0 ? (
          searchQuery ? (
            <>
              {filteredUsers.length} of {total} {mode}
            </>
          ) : (
            <>
              {total} {mode}
            </>
          )
        ) : (
          <>No {mode} yet</>
        )}
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-2">
        {error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading {mode}...</span>
              </div>
            ) : searchQuery ? (
              <p>No users match "{searchQuery}"</p>
            ) : (
              <p>No {mode} yet</p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <FollowerRow key={user.id} user={user} />
            ))}

            {/* Infinite scroll trigger */}
            {hasMore && !searchQuery && (
              <div ref={observerTarget} className="py-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: Modal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="hidden lg:flex lg:flex-col sm:max-w-md h-[600px] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>

      {/* Mobile: Drawer */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="lg:hidden h-[80vh] p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    </>
  )
}
