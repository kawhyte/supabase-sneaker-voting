'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

/**
 * Cat quotes to encourage users away from shopping impulses
 * and toward better wardrobe management activities
 */
const CAT_QUOTES = [
  {
    text: 'Why shop when you can create? ✨',
    emoji: '🎨',
    activity: 'Build an outfit',
    activityHint: 'Mix and match pieces you already own',
  },
  {
    text: 'Organize first, shop later! 📦',
    emoji: '🧹',
    activity: 'Clean your closet',
    activityHint: 'You might rediscover forgotten favorites',
  },
  {
    text: 'Every closet needs a refresh. Let\'s shuffle! 🔄',
    emoji: '🎯',
    activity: 'Generate outfit combinations',
    activityHint: 'Try random outfit suggestions',
  },
  {
    text: 'The best purchase is wearing what you have. 👗',
    emoji: '👠',
    activity: 'Check your cost-per-wear',
    activityHint: 'See which items are earning their keep',
  },
  {
    text: 'Before buying, style it first! 💭',
    emoji: '🧩',
    activity: 'Create an outfit',
    activityHint: 'See how new items would work with your wardrobe',
  },
  {
    text: 'Patience is a virtue, and so is good style. 🐾',
    emoji: '⏰',
    activity: 'Browse your collection',
    activityHint: 'Browse through your owned items for inspiration',
  },
  {
    text: 'A curated wardrobe beats a crowded closet. 🎯',
    emoji: '✨',
    activity: 'Review your wishlist',
    activityHint: 'Reflect on items you really want',
  },
  {
    text: 'Great style is about wearing less, not buying more. 💎',
    emoji: '👑',
    activity: 'Track wear statistics',
    activityHint: 'See which items you love most',
  },
]

export interface InsteadOfShoppingActivity {
  label: string
  hint: string
  action: () => void
}

/**
 * Modal that shows when user opens the app, encouraging
 * alternative activities instead of shopping
 */
export function InsteadOfShoppingModal({
  isOpen,
  onClose,
  activities,
}: {
  isOpen: boolean
  onClose: () => void
  activities: InsteadOfShoppingActivity[]
}) {
  const [quote, setQuote] = useState(CAT_QUOTES[0])

  // Select random quote on mount
  useEffect(() => {
    const randomQuote = CAT_QUOTES[Math.floor(Math.random() * CAT_QUOTES.length)]
    setQuote(randomQuote)
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:bg-muted rounded-md"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center justify-center py-8 px-4">
          {/* Cat Quote */}
          <div className="text-5xl mb-4">{quote.emoji}</div>

          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            Hold on! 😺
          </h2>

          <p className="text-center text-lg text-foreground font-semibold mb-6">
            {quote.text}
          </p>

          {/* Activities */}
          <div className="w-full space-y-3 mb-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Instead, try one of these:
            </p>

            {activities.map((activity) => (
              <Card
                key={activity.label}
                className="p-4 cursor-pointer hover:bg-sun-100 transition-colors border-stone-300"
                onClick={() => {
                  activity.action()
                  onClose()
                }}
              >
                <p className="font-medium text-foreground">{activity.label}</p>
                <p className="text-xs text-muted-foreground">{activity.hint}</p>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mb-6">
            Remember: The best wardrobe is one you actually wear! 🐾
          </p>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            I'll browse anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to manage the Instead of Shopping modal
 * Call on app load to show suggestion
 */
export function useInsteadOfShoppingModal(enabled: boolean = true) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasShownToday, setHasShownToday] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Check if we've already shown this today
    const lastShownKey = 'last_shopping_prompt_date'
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem(lastShownKey)

    if (lastShown !== today && !hasShownToday) {
      // Show with a 2-second delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem(lastShownKey, today)
        setHasShownToday(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [enabled, hasShownToday])

  const closeModal = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    closeModal,
  }
}
