'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SneakerPaletteCard } from '@/components/sneaker-inspo/SneakerPaletteCard'
import { StyleGuideDialog } from '@/components/sneaker-inspo/StyleGuideDialog'
import { FitFormulaCard } from '@/components/sneaker-inspo/FitFormulaCard'
import { SneakerSelectorDrawer } from '@/components/sneaker-inspo/SneakerSelectorDrawer'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { Button } from '@/components/ui/button'
import { analyzeAndSaveColors } from '@/app/actions/color-analysis'
import { toast } from 'sonner'
import { Palette, Loader2, AlertCircle, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { ColorWithRole } from '@/lib/color-utils'
import { buildFormulaAdvice } from '@/lib/fit-formula-utils'
import { cn } from '@/lib/utils'

interface SneakerInspirationViewProps {
  showHeader?: boolean
  className?: string
}

const FIT_FORMULAS = [
  {
    id: 'monochromatic',
    title: 'Monochromatic / Tonal',
    description: 'One color family, head to toe. Let texture and silhouette do the talking.',
  },
  {
    id: 'high-contrast',
    title: 'High-Contrast',
    description: "Opposites attract. Use the shoe's boldest color as a graphic accent.",
  },
  {
    id: 'anchor',
    title: 'The Anchor',
    description: 'Neutral base — let the shoe be the star. Everything else steps back.',
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
  const [error, setError] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [generatingPaletteFor, setGeneratingPaletteFor] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const fitFormulaSectionRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const updateScrollState = () => {
    const el = carouselRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  useEffect(() => {
    loadSneakers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = carouselRef.current
    if (!el) return
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => ro.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

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

  const handleSelectItem = async (itemId: string) => {
    const next = selectedItemId === itemId ? null : itemId
    setSelectedItemId(next)
    if (!next) return

    const item = items.find(i => i.id === itemId)

    if (!item || hasPalette(item)) {
      setTimeout(() => {
        fitFormulaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
      return
    }

    // No palette — generate on the fly
    setGeneratingPaletteFor(itemId)
    try {
      const imageUrl = getCarouselImage(item)
      const result = await analyzeAndSaveColors(itemId, imageUrl)
      if (result.success && result.palette) {
        handlePaletteGenerated(itemId, result.palette)
      } else {
        toast.error('Could not generate palette for this sneaker.')
      }
    } catch {
      toast.error('Could not generate palette for this sneaker.')
    } finally {
      setGeneratingPaletteFor(null)
      setTimeout(() => {
        fitFormulaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  const selectedItem = items.find(item => item.id === selectedItemId) ?? null

  const getExtractedColors = (item: WardrobeItem): [string, string, string] => {
    // Use the raw primary_color for formula math — it's the unmodified vibrant primary.
    // bold[4] = "Shoe Accent" (secondary with slight sat boost), bold[1] = ambient accent.
    const primary = item.primary_color ?? '#888888'
    const palette = item.color_palette
    if (palette && typeof palette === 'object' && 'bold' in palette) {
      const bold = (palette as { bold: ColorWithRole[] }).bold
      return [primary, bold[4]?.hex ?? '#888888', bold[1]?.hex ?? '#888888']
    }
    return [primary, '#888888', '#888888']
  }

  const selectedHasBoldPalette = selectedItem
    ? !!(selectedItem.color_palette &&
        typeof selectedItem.color_palette === 'object' &&
        'bold' in selectedItem.color_palette)
    : false

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex gap-4 overflow-hidden mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <Skeleton className="w-24 h-24 rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
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
          <StyleGuideDialog />
        </div>
      )}

      {/* Empty state */}
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
          {/* ── Mobile: bottom-sheet sneaker picker ── */}
          <div className="sm:hidden mb-6">
            <SneakerSelectorDrawer
              items={items}
              selectedItemId={selectedItemId}
              selectedItem={selectedItem}
              onSelect={handleSelectItem}
            />
          </div>

          {/* ── Desktop: horizontal scroll carousel ── */}
          <div className="hidden sm:block relative mb-8">
            {canScrollLeft && (
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200/80 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div
              ref={carouselRef}
              onScroll={updateScrollState}
              className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onLoad={updateScrollState}
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
            {canScrollRight && (
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200/80 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Selection prompt */}
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

              {/* Generating skeleton */}
              {generatingPaletteFor === selectedItem.id && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
                  {[0, 1, 2].map(i => (
                    <Skeleton key={i} className="h-48 rounded-[2rem]" />
                  ))}
                </div>
              )}

              {/* Fit formulas — only when palette has been generated */}
              {generatingPaletteFor !== selectedItem.id && selectedHasBoldPalette && (
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
                          sneakerName={`${selectedItem.brand} ${selectedItem.model}`}
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
