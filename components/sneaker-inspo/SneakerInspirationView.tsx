'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SneakerPaletteCard } from '@/components/sneaker-inspo/SneakerPaletteCard'
import { StyleGuideDialog } from '@/components/sneaker-inspo/StyleGuideDialog'
import { FitFormulaCard } from '@/components/sneaker-inspo/FitFormulaCard'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { Button } from '@/components/ui/button'
import { migrateAllSneakers, migrateLegacyPalettes } from '@/app/actions/color-analysis'
import { toast } from 'sonner'
import { Palette, Loader2, AlertCircle, RefreshCw, X, Shirt, Wind, Layers, Watch, ShoppingBag, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { ColorWithRole } from '@/lib/color-utils'
import { buildFormulaAdvice } from '@/lib/fit-formula-utils'
import { cn } from '@/lib/utils'

interface SneakerInspirationViewProps {
  showHeader?: boolean
  className?: string
  page?: number
  buildPageUrl?: (page: number) => string
}

const FIT_FORMULAS = [
  {
    id: 'monochromatic',
    title: 'Monochromatic / Tonal',
    description: 'One color family, head to toe. Let texture and silhouette do the talking.',
    doodleItems: [
      { name: 'Tee', icon: Shirt },
      { name: 'Trousers', icon: Layers },
      { name: 'Jacket', icon: Wind },
    ],
  },
  {
    id: 'high-contrast',
    title: 'High-Contrast',
    description: "Opposites attract. Use the shoe's boldest color as a graphic accent.",
    doodleItems: [
      { name: 'Graphic Tee', icon: Shirt, isTinted: true },
      { name: 'Dark Bottoms', icon: Layers },
      { name: 'Accessory', icon: Watch },
    ],
  },
  {
    id: 'anchor',
    title: 'The Anchor',
    description: 'Neutral base — let the shoe be the star. Everything else steps back.',
    doodleItems: [
      { name: 'White Tee', icon: Shirt },
      { name: 'Khakis', icon: Layers },
      { name: 'Bag', icon: ShoppingBag },
    ],
  },
] as const

function getCarouselImage(item: WardrobeItem): string {
  const mainPhoto = item.item_photos?.find(p => p.is_main_image)
  if (mainPhoto?.image_url) return mainPhoto.image_url
  const firstPhoto = item.item_photos?.[0]
  if (firstPhoto?.image_url) return firstPhoto.image_url
  return item.image_url ?? '/placeholder.jpg'
}

function AutoSelectHandler({
  currentSelectedId,
  onSelect,
}: {
  currentSelectedId: string | null
  onSelect: (id: string) => void
}) {
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const inspoItemId = searchParams?.get('inspoItemId')
    if (inspoItemId && inspoItemId !== currentSelectedId) {
      onSelect(inspoItemId)
    }
  }, [searchParams, currentSelectedId, onSelect])

  return null
}

export function SneakerInspirationView({
  showHeader = true,
  className = '',
}: SneakerInspirationViewProps) {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigratingLegacy, setIsMigratingLegacy] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isLoggingId, setIsLoggingId] = useState<string | null>(null)
  const fitFormulaSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSneakers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSneakers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!user) {
        setError('Please sign in to view your sneakers.')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('items')
        .select(
          `*, item_photos (id, image_url, image_order, is_main_image, cloudinary_id)`
        )
        .eq('user_id', user.id)
        .eq('status', 'owned')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setItems(data || [])
    } catch (err) {
      console.error('Error loading sneakers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load sneakers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateMissing = () => {
    startTransition(async () => {
      try {
        const [newResult, legacyResult] = await Promise.all([
          migrateAllSneakers(),
          migrateLegacyPalettes()
        ])

        const totalProcessed = newResult.succeeded + legacyResult.succeeded

        if (newResult.success && legacyResult.success) {
          toast.success(`Successfully generated formulas for ${totalProcessed} items!`)
        } else {
          toast.error('Migration finished, but some formulas failed. Check console.')
        }

        await loadSneakers()
      } catch (error) {
        console.error('Migration error:', error)
        toast.error('An unexpected error occurred during generation')
      }
    })
  }

  const handleMigrateLegacy = async () => {
    setIsMigratingLegacy(true)

    try {
      const result = await migrateLegacyPalettes()

      if (result.success) {
        toast.success(result.message || 'Legacy palettes upgraded')
        await loadSneakers()
      } else {
        toast.error(result.message || 'Upgrade failed')
      }
    } catch (error) {
      console.error('Legacy migration error:', error)
      toast.error('An unexpected error occurred during upgrade.')
    } finally {
      setIsMigratingLegacy(false)
    }
  }

  const handlePaletteGenerated = (itemId: string, palette: { bold: ColorWithRole[]; muted: ColorWithRole[] }) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, color_palette: palette, primary_color: palette.bold[0].hex }
          : item
      )
    )
  }

  const hasPalette = (item: WardrobeItem): boolean => {
    if (!item.color_palette) return false
    if (typeof item.color_palette === 'object' && 'bold' in item.color_palette) {
      return item.color_palette.bold.length > 0 && item.color_palette.muted.length > 0
    }
    return Array.isArray(item.color_palette) && item.color_palette.length > 0
  }

  const hasLegacyPalette = (item: WardrobeItem): boolean => {
    if (!item.color_palette) return false
    return Array.isArray(item.color_palette)
  }

  const handleLogWear = async (item: WardrobeItem) => {
    setIsLoggingId(item.id)
    const newWears = (item.wears ?? 0) + 1

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, wears: newWears } : i))

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('items')
        .update({ wears: newWears })
        .eq('id', item.id)

      if (error) throw error

      toast.success('Wear logged! CPW updated.')
    } catch (err) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, wears: item.wears } : i))
      toast.error('Failed to log wear. Please try again.')
    } finally {
      setIsLoggingId(null)
    }
  }

  const handleSelectItem = (itemId: string) => {
    const next = selectedItemId === itemId ? null : itemId
    setSelectedItemId(next)
    if (next) {
      setTimeout(() => {
        fitFormulaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  const selectedItem = items.find(item => item.id === selectedItemId) ?? null

  const getExtractedColors = (item: WardrobeItem): [string, string, string] => {
    const palette = item.color_palette
    if (palette && typeof palette === 'object' && 'bold' in palette) {
      const bold = (palette as { bold: ColorWithRole[] }).bold
      return [
        bold[0]?.hex ?? '#888888',
        bold[1]?.hex ?? '#888888',
        bold[2]?.hex ?? '#888888',
      ]
    }
    return ['#888888', '#888888', '#888888']
  }

  const getProjectedCPW = (item: WardrobeItem): number => {
    const price = item.purchase_price ?? item.retail_price ?? 0
    if (!price) return 0
    const wears = (item.wears ?? 0) + 1
    return price / wears
  }

  const selectedHasBoldPalette = selectedItem
    ? !!(selectedItem.color_palette &&
        typeof selectedItem.color_palette === 'object' &&
        'bold' in selectedItem.color_palette)
    : false

  const itemsWithoutPalettes = items.filter(item => !hasPalette(item)).length
  const itemsWithLegacyPalettes = items.filter(item => hasLegacyPalette(item)).length

  if (isLoading) {
    return (
      <div className={className}>
        {/* Carousel skeleton */}
        <div className="flex gap-4 overflow-hidden mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <Skeleton className="w-24 h-24 rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        {/* Prompt area skeleton */}
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-4 ${className}`}>
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Error Loading Sneakers</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={loadSneakers} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <Suspense fallback={null}>
        <AutoSelectHandler
          currentSelectedId={selectedItemId}
          onSelect={handleSelectItem}
        />
      </Suspense>

      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sneaker Inspiration</h1>
            <p className="text-muted-foreground mt-2">
              Discover harmonious color palettes from your sneakers to inspire your next outfit
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <StyleGuideDialog />
            {itemsWithLegacyPalettes > 0 && (
              <Button
                onClick={handleMigrateLegacy}
                disabled={isMigratingLegacy}
                size="lg"
                variant="outline"
              >
                {isMigratingLegacy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Upgrade to Dual-Vibe ({itemsWithLegacyPalettes})
                  </>
                )}
              </Button>
            )}

            {itemsWithoutPalettes > 0 && (
              <Button
                onClick={handleGenerateMissing}
                disabled={isPending}
                size="lg"
                variant="outline"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    Generate Missing Formulas ({itemsWithoutPalettes})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Compact action bar for dashboard tab */}
      {!showHeader && (itemsWithoutPalettes > 0 || itemsWithLegacyPalettes > 0) && (
        <div className="flex items-center justify-end gap-2 mb-6">
          {itemsWithLegacyPalettes > 0 && (
            <Button
              onClick={handleMigrateLegacy}
              disabled={isMigratingLegacy}
              size="sm"
              variant="outline"
            >
              {isMigratingLegacy ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Upgrade ({itemsWithLegacyPalettes})
                </>
              )}
            </Button>
          )}

          {itemsWithoutPalettes > 0 && (
            <Button
              onClick={handleGenerateMissing}
              disabled={isPending}
              size="sm"
              variant="outline"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Palette className="h-3 w-3 mr-2" />
                  Generate Missing ({itemsWithoutPalettes})
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Empty state — no sneakers in collection */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 py-12">
          <Palette className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">No Sneakers Yet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Add some sneakers to your collection to see their color palettes and get styling inspiration!
          </p>
          <Button asChild>
            <a href="/add-new-item">Add Your First Sneaker</a>
          </Button>
        </div>
      ) : (
        <>
          {/* Sneaker selector carousel */}
          <div
            className="flex gap-4 overflow-x-auto pb-4 mb-8 -mx-1 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 focus-visible:outline-none"
                aria-label={`Select ${item.brand} ${item.model}`}
              >
                <div
                  className={cn(
                    'w-24 h-24 rounded-2xl bg-card overflow-hidden ring-offset-background transition-all duration-150',
                    item.id === selectedItemId
                      ? 'ring-2 ring-offset-2 ring-[var(--color-sun-400)]'
                      : 'ring-1 ring-transparent hover:ring-border'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCarouselImage(item)}
                    alt={`${item.brand} ${item.model}`}
                    className="w-full h-full object-contain p-1.5"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground w-24 text-center truncate leading-tight">
                  {item.brand}
                </span>
              </button>
            ))}
          </div>

          {/* Selection prompt — items exist but nothing chosen yet */}
          {!selectedItemId && (
            <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 py-12 text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Select a pair from your rotation</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Pick a sneaker above to generate your styling lookbook.
              </p>
            </div>
          )}

          {/* Featured view — selected sneaker + fit formulas */}
          {selectedItem && (
            <div ref={fitFormulaSectionRef} className="scroll-mt-6">
              {/* Featured palette card */}
              <div className="max-w-xs mx-auto">
                <SneakerPaletteCard
                  item={selectedItem}
                  onPaletteGenerated={handlePaletteGenerated}
                  isSelected={true}
                  onSelect={() => handleSelectItem(selectedItem.id)}
                />
              </div>

              {/* Fit formulas — only when palette has been generated */}
              {selectedHasBoldPalette && (
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                        Fit Formulas
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {selectedItem.brand} {selectedItem.model}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedItemId(null)}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label="Dismiss fit formulas"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {FIT_FORMULAS.map(formula => {
                      const colors = getExtractedColors(selectedItem)
                      const { advice, swatches } = buildFormulaAdvice(formula.id, colors)
                      return (
                        <FitFormulaCard
                          key={formula.id}
                          title={formula.title}
                          description={formula.description}
                          colorAdvice={advice}
                          recommendedSwatches={swatches}
                          extractedColors={colors}
                          doodleItems={[...formula.doodleItems]}
                          sneakerName={`${selectedItem.brand} ${selectedItem.model}`}
                          projectedCPW={getProjectedCPW(selectedItem)}
                          onLogWear={() => handleLogWear(selectedItem)}
                          isPending={isLoggingId === selectedItem.id}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
