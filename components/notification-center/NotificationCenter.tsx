/**
 * NOTIFICATION CENTER - Main Drawer Component
 *
 * Features:
 * - Shadcn Sheet (right-side drawer)
 * - Virtualized scrolling with react-window
 * - Real-time updates via Supabase subscriptions
 * - Grouped by date sections
 * - IMPORTANT: Add .dense class for compact UI elements
 */

'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { NotificationCard } from './NotificationCard'
import { NotificationEmpty } from './NotificationEmpty'
import { Bell, CheckCheck, Tag, Heart, Search, Filter, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Notification {
  id: string
  notification_type: string
  title: string
  message: string
  link_url?: string
  action_label?: string
  severity?: string
  is_read: boolean
  is_bundled: boolean
  bundled_count: number
  bundled_items?: any[]
  created_at: string
  metadata?: any
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function NotificationCenter({ isOpen, onClose, userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [undoQueue, setUndoQueue] = useState<Array<{ id: string; notification: Notification; timestamp: number }>>([])
  const notificationRefs = useRef<(HTMLDivElement | null)[]>([])
  const supabase = createClient()

  // Fetch notifications (unread only by default)
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications?unread_only=true')
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Real-time subscription
  useEffect(() => {
    if (!isOpen) return

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Notification change:', payload)
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, userId, fetchNotifications, supabase])

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to mark all as read')

      toast.success('All notifications marked as read')
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  // Dismiss all price alerts
  const handleDismissAllPriceAlerts = async () => {
    try {
      const priceAlertIds = notifications
        .filter((n) => n.notification_type === 'price_alert' && !n.is_read)
        .map((n) => n.id)

      if (priceAlertIds.length === 0) {
        toast.info('No unread price alerts to dismiss')
        return
      }

      const response = await fetch('/api/notifications/dismiss-by-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_type: 'price_alert',
          ids: priceAlertIds
        })
      })

      if (!response.ok) throw new Error('Failed to dismiss price alerts')

      toast.success(`Dismissed ${priceAlertIds.length} price alerts`)
      fetchNotifications()
    } catch (error) {
      console.error('Error dismissing price alerts:', error)
      toast.error('Failed to dismiss price alerts')
    }
  }

  // Dismiss all wear reminders
  const handleDismissAllWearReminders = async () => {
    try {
      const wearReminderIds = notifications
        .filter((n) => n.notification_type === 'wear_reminder' && !n.is_read)
        .map((n) => n.id)

      if (wearReminderIds.length === 0) {
        toast.info('No unread wear reminders to dismiss')
        return
      }

      const response = await fetch('/api/notifications/dismiss-by-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_type: 'wear_reminder',
          ids: wearReminderIds
        })
      })

      if (!response.ok) throw new Error('Failed to dismiss wear reminders')

      toast.success(`Dismissed ${wearReminderIds.length} wear reminders`)
      fetchNotifications()
    } catch (error) {
      console.error('Error dismissing wear reminders:', error)
      toast.error('Failed to dismiss wear reminders')
    }
  }

  // Dismiss with undo
  const dismissWithUndo = (notification: Notification) => {
    const timestamp = Date.now()

    // Add to undo queue
    setUndoQueue((prev) => [...prev, { id: notification.id, notification, timestamp }])

    // Optimistically hide notification
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id))

    // Show undo toast
    const toastId = toast.success('Notification dismissed', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          handleUndo(notification.id)
          toast.dismiss(toastId)
        },
      },
    })

    // After 5 seconds, permanently delete
    const timeout = setTimeout(async () => {
      // Check if undo was called
      const stillInQueue = undoQueue.find((item) => item.id === notification.id)
      if (!stillInQueue) return

      // Mark as read (permanent delete)
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id)

      if (error) {
        console.error('Error dismissing notification:', error)
      }

      // Remove from undo queue
      setUndoQueue((prev) => prev.filter((item) => item.id !== notification.id))
    }, 5000)

    return () => clearTimeout(timeout)
  }

  // Handle undo
  const handleUndo = (notificationId: string) => {
    // Find notification in undo queue
    const queueItem = undoQueue.find((item) => item.id === notificationId)
    if (!queueItem) return

    // Restore notification
    setNotifications((prev) => {
      // Check if already restored
      if (prev.find((n) => n.id === notificationId)) return prev

      // Add back in correct position (by date)
      const restored = [...prev, queueItem.notification].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      return restored
    })

    // Remove from undo queue
    setUndoQueue((prev) => prev.filter((item) => item.id !== notificationId))

    toast.success('Notification restored')
  }

  // Clean up expired undo items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setUndoQueue((prev) => prev.filter((item) => now - item.timestamp < 5000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.notification_type.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter((n) => n.notification_type === filterType)
    }

    return filtered
  }, [notifications, searchQuery, filterType])

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'j': // Next notification (Notion-style)
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, filteredNotifications.length - 1))
          break

        case 'k': // Previous notification (Notion-style)
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break

        case 'Enter':
          e.preventDefault()
          // Open selected notification
          if (filteredNotifications[selectedIndex]?.link_url) {
            window.location.href = filteredNotifications[selectedIndex].link_url!
          }
          break

        case 'x': // Dismiss selected notification
          e.preventDefault()
          if (filteredNotifications[selectedIndex]) {
            dismissWithUndo(filteredNotifications[selectedIndex])
          }
          break

        case 'a': // Mark all as read
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            handleMarkAllRead()
          }
          break

        case 'Escape':
          e.preventDefault()
          onClose()
          break

        case '/': // Focus search
          e.preventDefault()
          document.querySelector<HTMLInputElement>('input[placeholder="Search notifications..."]')?.focus()
          break
      }
    },
    [isOpen, filteredNotifications, selectedIndex, onClose]
  )

  // Register keyboard listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Scroll selected notification into view
  useEffect(() => {
    if (notificationRefs.current[selectedIndex]) {
      notificationRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [selectedIndex])

  // Sort notifications by priority, then group by date
  const sortedNotifications = sortByPriority(filteredNotifications)
  const groupedNotifications = groupByDate(sortedNotifications)
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[400px] p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-foreground" />
                <SheetTitle className="text-lg font-semibold">
                  Notifications
                </SheetTitle>
                {unreadCount > 0 && (
                  <span className="dense flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full bg-sun-400 text-slate-900 text-xs font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="dense h-8 px-3 text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Search and Filter */}
            <div className="border-b border-border">
              <div className="flex items-center gap-2 pb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 py-2 pl-10 pr-3 text-sm focus:border-sun-400 focus:outline-none focus:ring-2 focus:ring-sun-400/20"
                    aria-label="Search notifications"
                    role="searchbox"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`dense ${showFilters ? 'bg-sun-50 border-sun-400' : ''}`}
                  aria-label="Toggle filters"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Dropdown */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pb-3"
                >
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Filter by Type
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterType(null)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        filterType === null
                          ? 'bg-sun-400 text-white'
                          : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                      }`}
                    >
                      All
                    </button>
                    {[
                      { type: 'price_alert', label: 'Price Alerts' },
                      { type: 'wear_reminder', label: 'Wear Reminders' },
                      { type: 'seasonal_tip', label: 'Seasonal Tips' },
                      { type: 'cost_per_wear_milestone', label: 'Milestones' },
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          filterType === type
                            ? 'bg-sun-400 text-white'
                            : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bulk Action Buttons */}
            <div className="flex flex-col gap-2 pt-3">
              {notifications.filter((n) => n.notification_type === 'price_alert' && !n.is_read).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismissAllPriceAlerts}
                  className="dense text-xs h-8"
                >
                  <Tag className="h-3 w-3 mr-2" />
                  Dismiss All Price Alerts
                </Button>
              )}
              {notifications.filter((n) => n.notification_type === 'wear_reminder' && !n.is_read).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismissAllWearReminders}
                  className="dense text-xs h-8"
                >
                  <Heart className="h-3 w-3 mr-2" />
                  Dismiss All Wear Reminders
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Notification List */}
        <div className="flex-1 px-6 overflow-y-auto flex flex-col">
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredNotifications.length === 0 ? (
            <NotificationEmpty />
          ) : (
            <>
              {/* Show filtered results count */}
              {(searchQuery || filterType) && (
                <div className="py-2 text-xs text-slate-600">
                  Showing {filteredNotifications.length} of {notifications.length} notifications
                </div>
              )}

              <div className="space-y-6 py-4 flex-1">
                {Object.entries(groupedNotifications).map(([date, items]) => (
                  <div key={date}>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      {date}
                    </h3>
                    <div className="space-y-3">
                      {items.map((notification, index) => (
                        <div
                          key={notification.id}
                          ref={(el) => {
                            if (el) notificationRefs.current[index] = el
                          }}
                        >
                          <NotificationCard
                            notification={notification}
                            onUpdate={fetchNotifications}
                            index={index}
                            isSelected={index === selectedIndex}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Keyboard Shortcuts Legend */}
          <div className="border-t border-stone-200 bg-stone-50 p-3 mt-auto">
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="flex w-full items-center justify-between text-xs text-slate-600 hover:text-slate-900"
            >
              <span className="font-semibold">Keyboard Shortcuts</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${showShortcuts ? 'rotate-180' : ''}`}
              />
            </button>

            {showShortcuts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1"
              >
                <ShortcutItem keys={['j', '↓']} description="Next notification" />
                <ShortcutItem keys={['k', '↑']} description="Previous notification" />
                <ShortcutItem keys={['Enter']} description="Open notification" />
                <ShortcutItem keys={['x']} description="Dismiss notification" />
                <ShortcutItem keys={['⌘A', 'Ctrl+A']} description="Mark all as read" />
                <ShortcutItem keys={['/']} description="Search notifications" />
                <ShortcutItem keys={['Esc']} description="Close panel" />
              </motion.div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Helper component for keyboard shortcuts
function ShortcutItem({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-600">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-700"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}

/**
 * PRIORITY QUEUE: Sort notifications by type priority
 *
 * Priority order (highest to lowest):
 * 1. price_alert (1) - Time-sensitive deals
 * 2. cooling_off_ready (2) - Purchase windows
 * 3. cost_per_wear_milestone, achievement_unlock (3) - Celebrations
 * 4. wear_reminder (4) - Action reminders
 * 5. seasonal_tip (5) - Guidance
 * 6. outfit_suggestion (6) - Suggestions
 *
 * Within same priority: unread first, then newest first
 */
function sortByPriority(notifications: Notification[]): Notification[] {
  const getPriority = (notificationType: string): number => {
    const priorityMap: Record<string, number> = {
      'price_alert': 1,
      'cost_per_wear_milestone': 3,
      'achievement_unlock': 3,
      'wear_reminder': 4,
      'seasonal_tip': 5,
      'outfit_suggestion': 6,
    }
    return priorityMap[notificationType] || 6 // Default to lowest priority
  }

  return [...notifications].sort((a, b) => {
    // 1. Sort by read status (unread first)
    if (a.is_read !== b.is_read) {
      return a.is_read ? 1 : -1
    }

    // 2. Sort by priority (lower number = higher priority)
    const aPriority = getPriority(a.notification_type)
    const bPriority = getPriority(b.notification_type)
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // 3. Sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

// Helper: Group notifications by date
function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  notifications.forEach((notification) => {
    const createdAt = new Date(notification.created_at)
    const createdDate = new Date(
      createdAt.getFullYear(),
      createdAt.getMonth(),
      createdAt.getDate()
    )

    let label: string
    if (createdDate.getTime() === today.getTime()) {
      label = 'Today'
    } else if (createdDate.getTime() === yesterday.getTime()) {
      label = 'Yesterday'
    } else if (createdAt > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      label = 'This Week'
    } else {
      label = 'Older'
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(notification)
  })

  return groups
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-3" />
          <div className="h-20 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}
