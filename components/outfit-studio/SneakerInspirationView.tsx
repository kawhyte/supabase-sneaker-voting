'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SneakerPaletteCard } from '@/components/outfit-studio/SneakerPaletteCard'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { Button } from '@/components/ui/button'
import { migrateAllSneakers } from '@/app/actions/color-analysis'
import { toast } from '@/components/ui/use-toast'
import { Palette, Loader2, AlertCircle } from 'lucide-react'

interface SneakerInspirationViewProps {
  showHeader?: boolean
  className?: string
}

/**
 * SneakerInspirationView - Shared component for displaying sneaker grid with color palettes
 *
 * Can be used in dashboard tabs or standalone pages.
 * Shows responsive grid of sneakers with generated color palettes.
 */
export function SneakerInspirationView({
  showHeader = true,
  className = ''
}: SneakerInspirationViewProps) {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleMigrateAll = async () => {
    setIsMigrating(true)

    try {
      const result = await migrateAllSneakers()

      if (result.success) {
        toast({
          title: 'Migration Complete',
          description: result.message
        })

        // Reload items to show newly generated palettes
        await loadSneakers()
      } else {
        toast({
          title: 'Migration Failed',
          description: result.message,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast({
        title: 'Migration Error',
        description: 'An unexpected error occurred during migration.',
        variant: 'destructive'
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const handlePaletteGenerated = (itemId: string, colors: string[]) => {
    // Update local state with the newly generated palette
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, color_palette: colors, primary_color: colors[0] }
          : item
      )
    )
  }

  // Count items without palettes
  const itemsWithoutPalettes = items.filter(
    item => !item.color_palette || item.color_palette.length === 0
  ).length

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-4 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-sun-400" />
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

          {/* Batch Migration Button */}
          {itemsWithoutPalettes > 0 && (
            <Button
              onClick={handleMigrateAll}
              disabled={isMigrating}
              size="lg"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Palette className="h-4 w-4 mr-2" />
                  Generate All ({itemsWithoutPalettes})
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Compact header for dashboard tab */}
      {!showHeader && itemsWithoutPalettes > 0 && (
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={handleMigrateAll}
            disabled={isMigrating}
            size="sm"
          >
            {isMigrating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Palette className="h-4 w-4 mr-2" />
                Generate All ({itemsWithoutPalettes})
              </>
            )}
          </Button>
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
              />
            ))}
          </div>

          {/* Stats Footer */}
          {showHeader && (
            <div className="mt-12 pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
                <p>
                  Showing {items.length} {items.length === 1 ? 'sneaker' : 'sneakers'}
                </p>
                {itemsWithoutPalettes > 0 && (
                  <p>
                    {itemsWithoutPalettes} {itemsWithoutPalettes === 1 ? 'sneaker needs' : 'sneakers need'} color palette generation
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
