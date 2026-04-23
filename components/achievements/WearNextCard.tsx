'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Footprints, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { LeastWornItem } from '@/lib/achievements-stats'
import { ItemNameDisplay } from '@/components/shared/ItemNameDisplay'
import { CATEGORY_CONFIGS } from '@/components/types/item-category'

interface WearNextCardProps {
  item: LeastWornItem | undefined
  userId: string | null
  onWearLogged?: () => void
}

export function WearNextCard({ item, userId, onWearLogged }: WearNextCardProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [localWears, setLocalWears] = useState<number | null>(null)

  if (!item) return null

  // Narrow to non-undefined for use in callbacks
  const safeItem = item

  const displayWears = localWears ?? safeItem.wears
  const daysLabel = safeItem.wears === 0
    ? safeItem.daysSinceAdded
      ? `Sitting ${safeItem.daysSinceAdded} days unworn`
      : 'Never worn'
    : safeItem.daysSinceLastWorn !== null
      ? `Last worn ${safeItem.daysSinceLastWorn} days ago`
      : `${displayWears} wears total`

  async function handleLogWear() {
    if (!userId || isLogging) return
    setIsLogging(true)

    try {
      const supabase = createClient()
      const now = new Date().toISOString()
      const newWears = safeItem.wears + 1

      const { error } = await supabase
        .from('items')
        .update({ wears: newWears, last_worn_date: now })
        .eq('id', safeItem.id)

      if (error) {
        toast({ title: 'Failed to log wear', description: error.message, variant: 'destructive' })
        return
      }

      setLocalWears(newWears)

      fetch('/api/check-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).catch(() => {})

      toast({ title: 'Wear logged', description: `${safeItem.brand} ${safeItem.model} — ${newWears} total wears` })
      onWearLogged?.()
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' })
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <section
      className="bg-card border border-border rounded-xl p-6"
      aria-labelledby="wear-next-title"
    >
      <div className="flex items-center gap-2 mb-5">
        <Footprints className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 id="wear-next-title" className="text-lg font-bold text-foreground">
          Wear Next
        </h3>
      </div>

      <div className="flex items-center gap-4 mb-5">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {safeItem.image_url ? (
            <Image
              src={safeItem.image_url}
              alt={`${safeItem.brand} ${safeItem.model}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {(() => {
                const CategoryIcon = CATEGORY_CONFIGS[safeItem.category as keyof typeof CATEGORY_CONFIGS]?.icon
                return CategoryIcon
                  ? <CategoryIcon className="h-8 w-8 text-muted-foreground" />
                  : <Footprints className="h-8 w-8 text-muted-foreground" />
              })()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <ItemNameDisplay
            brand={safeItem.brand}
            model={safeItem.model}
            color={safeItem.color}
            className="mb-1"
            maxLength={30}
          />
          <p className="text-xs text-muted-foreground">{daysLabel}</p>
        </div>
      </div>

      <button
        onClick={handleLogWear}
        disabled={isLogging}
        className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {isLogging ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Logging…
          </>
        ) : (
          'Log Wear'
        )}
      </button>
    </section>
  )
}
