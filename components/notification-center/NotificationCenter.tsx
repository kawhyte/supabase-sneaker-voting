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

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { NotificationCard } from './NotificationCard'
import { NotificationEmpty } from './NotificationEmpty'
import { Bell, CheckCheck, Tag, Heart } from 'lucide-react'
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
  const supabase = createClient()

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications')
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

  // Group notifications by date
  const groupedNotifications = groupByDate(notifications)
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

            {/* Bulk Action Buttons */}
            <div className="flex flex-col gap-2">
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
        <div className="flex-1 px-6 overflow-y-auto">
          {isLoading ? (
            <LoadingSkeleton />
          ) : notifications.length === 0 ? (
            <NotificationEmpty />
          ) : (
            <div className="space-y-6 py-4">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {items.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onUpdate={fetchNotifications}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
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
