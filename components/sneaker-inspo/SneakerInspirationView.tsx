'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SneakerPaletteCard } from '@/components/sneaker-inspo/SneakerPaletteCard'
import { StyleGuideDialog } from '@/components/sneaker-inspo/StyleGuideDialog'
import { FitFormulaCard } from '@/components/sneaker-inspo/FitFormulaCard'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { Button } from '@/components/ui/button'
import { migrateAllSneakers, migrateLegacyPalettes } from '@/app/actions/color-analysis'
import { toast } from 'sonner'
import { calculateWorthItMetrics } from '@/lib/wardrobe-item-utils'
import { Palette, Loader2, AlertCircle, RefreshCw, X, Shirt, Wind, Layers, Watch, ShoppingBag } from 'lucide-react'
import type { ColorWithRole } from '@/lib/color-utils'

interface SneakerInspirationViewProps {
  showHeader?: boolean
  className?: string
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

/**
 * SneakerInspirationView - Shared component for displaying owned sneaker grid with color palettes
 *
 * Can be used in dashboard tabs or standalone pages.
 * Shows responsive grid of OWNED sneakers (not wishlisted) with generated color palettes.
 */
export function SneakerInspirationView({
  showHeader = true,
  className = ''
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
  }, [])

  const loadSneakers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!user) {
        setError('Please sign in to view your sneakers.')
        return
      }

      // Fetch all footwear items (sneakers, shoes, footwear categories)
      const { data, error: fetchError } = await supabase
        .from('items')
        .select(`
          *,
          item_photos (
            id,
            image_url,
            image_order,
            is_main_image,
            cloudinary_id
          )
        `)
        .eq('user_id', user.id)
        .in('category', ['sneakers', 'shoes', 'footwear'])
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
        const result = await migrateAllSneakers()

        if (result.success) {
          toast.success(`Successfully generated formulas for ${result.succeeded} items!`)
          await loadSneakers()
        } else {
          toast.error(result.message || 'Failed to generate formulas')
        }
      } catch (error) {
        console.error('Migration error:', error)
        toast.error('An unexpected error occurred')
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
    // Update local state with the newly generated palette
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, color_palette: palette, primary_color: palette.bold[0].hex }
          : item
      )
    )
  }

  // Helper: Check if item has a valid palette (either format)
  const hasPalette = (item: WardrobeItem): boolean => {
    if (!item.color_palette) return false

    // Check if it's the new object format
    if (typeof item.color_palette === 'object' && 'bold' in item.color_palette) {
      return item.color_palette.bold.length > 0 && item.color_palette.muted.length > 0
    }

    // Check if it's the legacy array format
    return Array.isArray(item.color_palette) && item.color_palette.length > 0
  }

  // Helper: Check if item has legacy palette format (array instead of object)
  const hasLegacyPalette = (item: WardrobeItem): boolean => {
    if (!item.color_palette) return false
    return Array.isArray(item.color_palette)
  }

  const handleLogWear = async (item: WardrobeItem) => {
    setIsLoggingId(item.id)
    const newWears = (item.wears ?? 0) + 1

    // Optimistic update
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

  // Derive extracted colors + projected CPW for the selected item
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

  // Count items without palettes
  const itemsWithoutPalettes = items.filter(item => !hasPalette(item)).length

  // Count items with legacy palette format that need upgrade
  const itemsWithLegacyPalettes = items.filter(item => hasLegacyPalette(item)).length

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-4 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your sneakers...</p>
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
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sneaker Inspiration</h1>
            <p className="text-muted-foreground mt-2">
              Discover harmonious color palettes from your sneakers to inspire your next outfit
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Style Guide Dialog Button */}
            <StyleGuideDialog />
            {/* Upgrade Legacy Palettes Button */}
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

            {/* Batch Migration Button */}
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

      {/* Compact header for dashboard tab */}
      {!showHeader && (itemsWithoutPalettes > 0 || itemsWithLegacyPalettes > 0) && (
        <div className="flex items-center justify-end gap-2 mb-6">
          {/* Upgrade Legacy Palettes Button */}
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

          {/* Generate All Button */}
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

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 py-12">
          <Palette className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">No Sneakers Yet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Add some sneakers to your wardrobe to see their color palettes and get outfit inspiration!
          </p>
          <Button asChild>
            <a href="/dashboard/add-product">Add Your First Sneaker</a>
          </Button>
        </div>
      ) : (
        <>
          {/* Grid of Sneaker Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map(item => (
              <SneakerPaletteCard
                key={item.id}
                item={item}
                onPaletteGenerated={handlePaletteGenerated}
                isSelected={item.id === selectedItemId}
                onSelect={() => handleSelectItem(item.id)}
              />
            ))}
          </div>

          {/* Fit Formulas Section */}
          {selectedItem && selectedHasBoldPalette && (
            <div ref={fitFormulaSectionRef} className="mt-10 scroll-mt-6">
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
                {FIT_FORMULAS.map(formula => (
                  <FitFormulaCard
                    key={formula.id}
                    title={formula.title}
                    description={formula.description}
                    extractedColors={getExtractedColors(selectedItem)}
                    doodleItems={formula.doodleItems.map(d => ({ ...d }))}
                    sneakerName={`${selectedItem.brand} ${selectedItem.model}`}
                    projectedCPW={getProjectedCPW(selectedItem)}
                    onLogWear={() => handleLogWear(selectedItem)}
                    isPending={isLoggingId === selectedItem.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stats Footer */}
          {showHeader && (
            <div className="mt-12 pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
                <p>
                  Showing {items.length} {items.length === 1 ? 'sneaker' : 'sneakers'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {itemsWithLegacyPalettes > 0 && (
                    <p>
                      {itemsWithLegacyPalettes} {itemsWithLegacyPalettes === 1 ? 'palette can' : 'palettes can'} be upgraded to dual-vibe
                    </p>
                  )}
                  {itemsWithoutPalettes > 0 && (
                    <p>
                      {itemsWithoutPalettes} {itemsWithoutPalettes === 1 ? 'sneaker needs' : 'sneakers need'} color palette generation
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
