/**
 * NOTIFICATION CARD - Individual Notification Display
 *
 * Features:
 * - Type-specific icons and colors
 * - Action buttons (View, Snooze, Dismiss)
 * - Expand/collapse for bundled notifications
 * - Swipe to dismiss on mobile
 * - IMPORTANT: Use .dense class for compact buttons
 */

'use client'

import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Package,
  Tag,
  Sparkles,
  Trophy,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Heart,
  Palette
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface NotificationCardProps {
  notification: any
  onUpdate: () => void
}

export function NotificationCard({ notification, onUpdate }: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const router = useRouter()

  // Swipe to dismiss handlers
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left') {
        setIsSwiping(true)
        setSwipeOffset(Math.min(0, eventData.deltaX))
      }
    },
    onSwipedLeft: () => {
      if (Math.abs(swipeOffset) > 100) {
        handleDismiss()
      } else {
        setIsSwiping(false)
        setSwipeOffset(0)
      }
    },
    onSwiped: () => {
      setIsSwiping(false)
      setSwipeOffset(0)
    },
    trackMouse: false
  })

  // Mark as read
  const handleMarkAsRead = async () => {
    if (notification.is_read) return

    try {
      const response = await fetch(`/api/notifications/${notification.id}/read`, {
        method: 'PUT'
      })

      if (!response.ok) throw new Error('Failed to mark as read')

      toast.success('Marked as read')
      onUpdate()
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  // Snooze notification
  const handleSnooze = async (days: number = 3) => {
    try {
      const response = await fetch(`/api/notifications/${notification.id}/snooze`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      })

      if (!response.ok) throw new Error('Failed to snooze')

      toast.success(`Snoozed for ${days} days`)
      onUpdate()
    } catch (error) {
      console.error('Error snoozing:', error)
      toast.error('Failed to snooze')
    }
  }

  // Dismiss (mark as read and hide)
  const handleDismiss = async () => {
    await handleMarkAsRead()
  }

  const icon = getNotificationIcon(notification.notification_type)
  const severity = notification.severity || 'low'

  return (
    <motion.div
      {...handlers}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: swipeOffset,
        transition: { duration: isSwiping ? 0 : 0.2 }
      }}
      exit={{ opacity: 0, x: -100 }}
      className="relative"
    >
      <div
        className={`
          rounded-lg border p-4
          ${!notification.is_read ? 'bg-card border-l-4' : 'bg-muted/30 border-l-4'}
          ${severity === 'high' ? 'border-l-red-500' : ''}
          ${severity === 'medium' ? 'border-l-yellow-500' : ''}
          ${severity === 'low' ? 'border-l-blue-500' : ''}
          transition-all hover:shadow-md
        `}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`
            dense flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${severity === 'high' ? 'bg-red-100 text-red-600' : ''}
            ${severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
            ${severity === 'low' ? 'bg-blue-100 text-blue-600' : ''}
          `}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground line-clamp-2">
                  {notification.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
              </div>

              {/* Dismiss button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="dense h-6 w-6 flex-shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Timestamp */}
            <span className="text-xs text-muted-foreground mt-2 inline-block">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>

            {/* Bundled items expansion */}
            {notification.is_bundled && notification.bundled_count > 1 && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="dense h-7 px-2 text-xs"
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                  {isExpanded ? 'Show less' : `Show ${notification.bundled_count} items`}
                </Button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-2 overflow-hidden"
                    >
                      {notification.bundled_items?.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="dense flex items-center gap-2 p-2 rounded bg-muted/50"
                        >
                          {item.itemImage && (
                            <img
                              src={item.itemImage}
                              alt={item.itemName}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.itemName}</p>
                            {item.daysUnworn && (
                              <p className="text-xs text-muted-foreground">
                                {item.daysUnworn} days unworn
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Seasonal Tips Section */}
            {notification.notification_type === 'seasonal_tip' && notification.metadata && (
              <div className="mt-3 space-y-3">
                {/* Tips Section */}
                {notification.metadata.tips && Array.isArray(notification.metadata.tips) && notification.metadata.tips.length > 0 && (
                  <div className="rounded-lg bg-sun-50 p-3">
                    <p className="mb-2 font-semibold text-xs text-slate-700 uppercase tracking-wide">
                      What to do this season:
                    </p>
                    <ul className="space-y-1.5">
                      {notification.metadata.tips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-sun-600 flex-shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Categories Section */}
                {notification.metadata.suggested_categories && Array.isArray(notification.metadata.suggested_categories) && notification.metadata.suggested_categories.length > 0 && (
                  <div>
                    <p className="mb-2 font-semibold text-xs text-slate-700 uppercase tracking-wide">
                      Focus on these categories:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {notification.metadata.suggested_categories.map((category: string, index: number) => (
                        <span
                          key={index}
                          className="rounded-full bg-sun-200 px-3 py-1 text-xs font-semibold text-sun-900"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      router.push('/dashboard?tab=outfits&action=create')
                      handleMarkAsRead()
                    }}
                    className="flex-1 text-xs h-8"
                  >
                    <Sparkles className="mr-2 h-3 w-3" />
                    Create Outfit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push('/dashboard?tab=owned')
                      handleMarkAsRead()
                    }}
                    className="flex-1 text-xs h-8"
                  >
                    <Palette className="mr-2 h-3 w-3" />
                    Organize
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="dense flex items-center gap-2 mt-3">
              {notification.link_url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 px-3 text-xs"
                >
                  <a href={notification.link_url}>
                    {notification.action_label || 'View'}
                  </a>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSnooze(3)}
                className="dense h-7 px-3 text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                Snooze
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Helper: Get icon for notification type
function getNotificationIcon(type: string) {
  const icons: Record<string, JSX.Element> = {
    price_alert: <Tag className="h-4 w-4" />,
    wear_reminder: <Package className="h-4 w-4" />,
    seasonal_tip: <Sparkles className="h-4 w-4" />,
    achievement_unlock: <Trophy className="h-4 w-4" />,
    outfit_suggestion: <Bell className="h-4 w-4" />
  }

  return icons[type] || <Bell className="h-4 w-4" />
}
