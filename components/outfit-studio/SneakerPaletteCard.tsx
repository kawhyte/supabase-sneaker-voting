'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { analyzeAndSaveColors } from '@/app/actions/color-analysis'
import { cn } from '@/lib/utils'
import { Loader2, Palette, Zap, Coffee, RefreshCw } from 'lucide-react'

interface SneakerPaletteCardProps {
  item: WardrobeItem
  onPaletteGenerated?: (itemId: string, palette: { bold: string[]; muted: string[] }) => void
}

type PaletteMode = 'bold' | 'muted'

type ColorPaletteData = string[] | { bold: string[]; muted: string[] }

/**
 * SneakerPaletteCard - Displays a sneaker with its harmonious 5-color palette
 *
 * Features:
 * - Shows sneaker image in 4:3 aspect ratio
 * - Displays 5 color circles below image
 * - Toggle between Bold (streetwear) and Muted (office) vibes
 * - Backward compatible with legacy single-palette format
 * - Click color circle to copy hex code
 * - Generate Palette button if no palette exists
 * - Loading state during palette generation
 * - Toast notification on color copy
 */
export function SneakerPaletteCard({ item, onPaletteGenerated }: SneakerPaletteCardProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [mode, setMode] = useState<PaletteMode>('bold')
  const [localPalette, setLocalPalette] = useState<ColorPaletteData | null>(
    item.color_palette || null
  )

  // Helper: Check if palette is new format (object) or legacy format (array)
  const isNewFormat = (palette: ColorPaletteData): palette is { bold: string[]; muted: string[] } => {
    return palette !== null && typeof palette === 'object' && 'bold' in palette && 'muted' in palette
  }

  // Helper: Get the colors to display based on format and mode
  const getDisplayColors = (): string[] | null => {
    if (!localPalette) return null

    if (isNewFormat(localPalette)) {
      // New format: return bold or muted based on mode
      return localPalette[mode]
    } else {
      // Legacy format: just return the array
      return localPalette
    }
  }

  const displayColors = getDisplayColors()
  const showToggle = localPalette && isNewFormat(localPalette)

  // Get image URL (priority: main photo > legacy > first photo)
  const mainPhoto = item.item_photos?.find(photo => photo.is_main_image)
  const imageUrl = mainPhoto?.image_url || item.image_url || item.item_photos?.[0]?.image_url

  const handleGeneratePalette = async () => {
    if (!imageUrl) {
      toast({
        title: 'No Image',
        description: 'This item needs an image to generate a color palette.',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)

    try {
      const result = await analyzeAndSaveColors(item.id, imageUrl)

      if (result.success && result.palette) {
        setLocalPalette(result.palette)
        onPaletteGenerated?.(item.id, result.palette)

        toast({
          title: 'Dual Palette Generated',
          description: 'Bold and Muted color palettes created successfully!'
        })
      } else {
        toast({
          title: 'Generation Failed',
          description: result.message || 'Could not generate color palette.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error generating palette:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleColorClick = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      toast({
        title: 'Color Copied',
        description: (
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded border border-border"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="font-mono text-sm">{color}</span>
          </div>
        )
      })
    } catch (error) {
      console.error('Failed to copy color:', error)
      toast({
        title: 'Copy Failed',
        description: 'Could not copy color to clipboard.',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Sneaker Image */}
        <div className="relative w-full aspect-[4/3] bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${item.brand} ${item.model}`}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-base leading-tight truncate">
              {item.brand}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {item.model}
            </p>
          </div>

          {/* Color Palette or Generate Button */}
          {displayColors && displayColors.length === 5 ? (
            <div className="space-y-3">
              {/* Toggle between Bold and Muted (only for new format) */}
              {showToggle && (
                <Tabs value={mode} onValueChange={(value) => setMode(value as PaletteMode)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-8">
                    <TabsTrigger value="bold" className="text-xs flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Bold
                    </TabsTrigger>
                    <TabsTrigger value="muted" className="text-xs flex items-center gap-1">
                      <Coffee className="h-3 w-3" />
                      Muted
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {/* Color circles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">
                    {showToggle
                      ? mode === 'bold'
                        ? 'Bold Palette (Streetwear)'
                        : 'Muted Palette (Office)'
                      : 'Color Palette'
                    }
                  </p>
                  {/* Regenerate button */}
                  <button
                    onClick={handleGeneratePalette}
                    disabled={isGenerating || !imageUrl}
                    className={cn(
                      'p-1 rounded hover:bg-muted transition-colors',
                      'text-muted-foreground hover:text-foreground',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    title="Regenerate palette with new algorithm"
                    aria-label="Regenerate color palette"
                  >
                    <RefreshCw className={cn(
                      'h-3 w-3',
                      isGenerating && 'animate-spin'
                    )} />
                  </button>
                </div>
                <div className="flex gap-2 justify-between">
                  {displayColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorClick(color)}
                      className={cn(
                        'h-10 w-10 rounded-full border-2 border-border',
                        'transition-transform duration-150',
                        'hover:scale-110 hover:border-sun-400',
                        'active:scale-95',
                        'focus:outline-none focus:ring-2 focus:ring-sun-400 focus:ring-offset-2'
                      )}
                      style={{ backgroundColor: color }}
                      title={`Click to copy ${color}`}
                      aria-label={`Copy color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleGeneratePalette}
              disabled={isGenerating || !imageUrl}
              className="w-full"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Palette className="h-4 w-4 mr-2" />
                  Generate Palette
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
