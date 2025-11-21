'use client'

import { LucideIcon, Cat, Heart, Lightbulb, Palette, Sparkles, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Empty state for wardrobe (user has no owned items)
 * Shows a cozy illustration and call-to-action
 */
export function WardrobeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Cat className="h-16 w-16 mb-6 text-muted-foreground" />
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        Your wardrobe is sleeping
      </h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Time to wake up your closet! Add your first item to get started on your
        journey to conscious wardrobe management.
      </p>
      <Button className="bg-sun-400 hover:bg-sun-600 text-foreground">
        Add Your First Item
      </Button>
    </div>
  )
}

/**
 * Empty state for wishlist (user has no wishlist items)
 */
export function WishlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Heart className="h-16 w-16 mb-6 text-muted-foreground" />
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        Nothing on your wishlist yet
      </h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Found something you love? Add it here and take time to think about it. Our smart
        cooling-off period will help you make thoughtful purchases.
      </p>
      <p className="text-sm text-muted-foreground text-center max-w-sm flex items-center justify-center gap-2">
        <Lightbulb className="h-4 w-4" /> Pro tip: Create outfits with your owned items first to discover what you
        really need!
      </p>
    </div>
  )
}

/**
 * Empty state for outfits (user has no outfits created)
 */
export function OutfitsEmptyState({ onCreateOutfit }: { onCreateOutfit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Palette className="h-16 w-16 mb-6 text-muted-foreground" />
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        No outfits yet
      </h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Mix and match your wardrobe to create stunning outfits. Visualize your style
        and unlock exclusive features!
      </p>
      <Button
        onClick={onCreateOutfit}
        className="bg-sun-400 hover:bg-sun-600 text-foreground"
      >
        Create Your First Outfit
      </Button>
    </div>
  )
}

/**
 * Empty state for archive (user has no archived items)
 */
export function ArchiveEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Sparkles className="h-16 w-16 mb-6 text-muted-foreground" />
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        Archive is empty
      </h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Items you sell, donate, or retire will appear here. It's a great way to track
        your wardrobe journey over time.
      </p>
    </div>
  )
}

/**
 * Empty state when search returns no results
 */
export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Search className="h-16 w-16 mb-6 text-muted-foreground" />
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        No results found
      </h2>
      <p className="text-muted-foreground text-center max-w-sm">
        No items matching "{query}". Try adjusting your search or filters.
      </p>
    </div>
  )
}

/**
 * Generic empty state component that can be customized
 */
export function EmptyState({
  emoji,
  title,
  description,
  action,
  icon: Icon,
}: {
  emoji?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {emoji ? (
        <div className="text-6xl mb-6">{emoji}</div>
      ) : Icon ? (
        <Icon className="h-16 w-16 mb-6 text-muted-foreground opacity-50" />
      ) : null}
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        {title}
      </h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-sun-400 hover:bg-sun-600 text-foreground"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
