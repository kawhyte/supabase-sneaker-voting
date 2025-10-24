'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Heart } from 'lucide-react'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'

/**
 * Calculate days since an item was last worn
 */
function getDaysSinceLastWorn(item: SizingJournalEntry): number {
  if (!item.last_worn_date) {
    // If never worn, calculate from purchase date
    if (item.purchase_date) {
      const purchaseDate = new Date(item.purchase_date)
      const now = new Date()
      return Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
    }
    return Infinity
  }

  const lastWorn = new Date(item.last_worn_date)
  const now = new Date()
  return Math.floor((now.getTime() - lastWorn.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Get wear reminder message
 */
function getWearReminder(item: SizingJournalEntry): {
  emoji: string
  message: string
  daysUnworn: number
} {
  const daysUnworn = getDaysSinceLastWorn(item)

  if (daysUnworn > 90) {
    return {
      emoji: '😿',
      message: `Your ${item.color} ${item.category} hasn't been worn in ${daysUnworn} days!`,
      daysUnworn,
    }
  }

  if (daysUnworn > 60) {
    return {
      emoji: '😸',
      message: `Give your ${item.brand} ${item.model} some love - it's been ${daysUnworn} days!`,
      daysUnworn,
    }
  }

  if (daysUnworn > 30) {
    return {
      emoji: '😻',
      message: `Your ${item.color} ${item.category} misses you! (${daysUnworn} days)`,
      daysUnworn,
    }
  }

  return {
    emoji: '😺',
    message: `Your ${item.brand} ${item.model} is ready to be worn!`,
    daysUnworn,
  }
}

/**
 * Display a notification for an item that hasn't been worn recently
 */
export function WearReminderNotification({
  item,
  onDismiss,
  onWear,
}: {
  item: SizingJournalEntry
  onDismiss: (itemId: string) => void
  onWear: (itemId: string) => void
}) {
  const reminder = getWearReminder(item)

  return (
    <Card className="border-2 border-sun-400 bg-sun-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">{reminder.emoji}</div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">
              {reminder.message}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Brand: {item.brand} • Size: {item.size_tried || 'Not specified'}
            </p>
          </div>

          <button
            onClick={() => onDismiss(item.id)}
            className="flex-shrink-0 p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => onWear(item.id)}
            size="sm"
            className="bg-sun-400 hover:bg-sun-600 text-foreground flex-1"
          >
            <Heart className="h-4 w-4 mr-2" />
            I'll wear it today!
          </Button>
          <Button
            onClick={() => onDismiss(item.id)}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Component that checks for unworn items and displays reminders
 * Should be added to the layout or dashboard
 */
export function WearRemindersContainer({
  items,
  onWear,
}: {
  items: SizingJournalEntry[]
  onWear: (itemId: string) => void
}) {
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set())
  const [remindersToShow, setRemindersToShow] = useState<SizingJournalEntry[]>([])

  useEffect(() => {
    // Filter items that haven't been worn in 30+ days
    const unwornItems = items.filter((item) => {
      const daysUnworn = getDaysSinceLastWorn(item)
      return daysUnworn >= 30 && !dismissedItems.has(item.id)
    })

    // Show up to 3 reminders
    setRemindersToShow(unwornItems.slice(0, 3))
  }, [items, dismissedItems])

  const handleDismiss = (itemId: string) => {
    setDismissedItems((prev) => new Set(prev).add(itemId))
  }

  if (remindersToShow.length === 0) return null

  return (
    <div className="space-y-3">
      {remindersToShow.map((item) => (
        <WearReminderNotification
          key={item.id}
          item={item}
          onDismiss={handleDismiss}
          onWear={onWear}
        />
      ))}
    </div>
  )
}

/**
 * Hook to get unworn items for notifications
 * Can be used to trigger push notifications or emails
 */
export function useUnwornItemsForReminders(
  items: SizingJournalEntry[],
  daysThreshold: number = 30
) {
  const [unwornItems, setUnwornItems] = useState<SizingJournalEntry[]>([])

  useEffect(() => {
    const checkUnwornItems = () => {
      const unworn = items.filter((item) => {
        const daysUnworn = getDaysSinceLastWorn(item)
        return daysUnworn >= daysThreshold
      })
      setUnwornItems(unworn)
    }

    checkUnwornItems()
    // Check once per day
    const dailyTimer = setInterval(checkUnwornItems, 24 * 60 * 60 * 1000)

    return () => clearInterval(dailyTimer)
  }, [items, daysThreshold])

  return unwornItems
}
