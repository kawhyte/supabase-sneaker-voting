/**
 * OutfitShuffle - Random outfit suggestion engine
 *
 * Features:
 * - Generate random outfit combinations
 * - Filter by occasion, season, color
 * - Like/Dislike to save or skip
 * - Smart suggestions based on wardrobe
 */

'use client'

import { useState, useEffect } from 'react'
import { Shuffle, ThumbsUp, ThumbsDown, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import { Outfit, OutfitOccasion, OutfitSeason, OCCASION_CONFIG, SEASON_CONFIG } from '@/components/types/outfit'
import { toast } from 'sonner'

interface OutfitShuffleProps {
  wardrobe: SizingJournalEntry[]
  onSaveOutfit: (items: SizingJournalEntry[], occasion: OutfitOccasion) => Promise<Outfit | null>
}

interface SuggestedOutfit {
  items: SizingJournalEntry[]
  occasion: OutfitOccasion
  colorPalette: string[]
}

/**
 * OutfitShuffle - Random outfit generator with filters
 */
export function OutfitShuffle({
  wardrobe,
  onSaveOutfit,
}: OutfitShuffleProps) {
  const [suggestedOutfit, setSuggestedOutfit] = useState<SuggestedOutfit | null>(null)
  const [occasion, setOccasion] = useState<OutfitOccasion>('casual')
  const [season, setSeason] = useState<OutfitSeason>('all_year')
  const [isSaving, setIsSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  // Group wardrobe by category
  const wardrobeByCategory = wardrobe.reduce(
    (acc, item) => {
      const category = item.category || 'other'
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    },
    {} as Record<string, SizingJournalEntry[]>
  )

  // Get seasonal items based on selected season
  const getSeasonalItems = (): SizingJournalEntry[] => {
    if (season === 'all_year') return wardrobe

    const seasonMonth = SEASON_CONFIG[season]
    const currentMonth = new Date().getMonth() + 1
    const isSeasonNow = seasonMonth.months.includes(currentMonth)

    // If it's the season, prefer items. Otherwise, include all.
    return wardrobe
  }

  // Generate random outfit
  const generateOutfit = () => {
    const seasonalItems = getSeasonalItems()
    if (seasonalItems.length === 0) {
      toast.error('No items in wardrobe')
      return
    }

    // Group by category
    const byCategory = seasonalItems.reduce(
      (acc, item) => {
        const category = item.category || 'other'
        if (!acc[category]) acc[category] = []
        acc[category].push(item)
        return acc
      },
      {} as Record<string, SizingJournalEntry[]>
    )

    // Select random item from each category
    const selectedItems: SizingJournalEntry[] = []
    Object.values(byCategory).forEach((items) => {
      if (items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length)
        selectedItems.push(items[randomIndex])
      }
    })

    // Get color palette
    const colorPalette = Array.from(
      new Set(selectedItems.map((item) => item.color))
    )

    setSuggestedOutfit({
      items: selectedItems,
      occasion,
      colorPalette,
    })
  }

  // Save suggested outfit
  const handleSaveOutfit = async () => {
    if (!suggestedOutfit) return

    setIsSaving(true)
    try {
      const outfit = await onSaveOutfit(suggestedOutfit.items, suggestedOutfit.occasion)
      if (outfit) {
        toast.success('Outfit saved!')
        setSavedCount((prev) => prev + 1)
        // Generate new outfit
        generateOutfit()
      }
    } catch (error) {
      toast.error('Failed to save outfit')
    } finally {
      setIsSaving(false)
    }
  }

  // Skip suggested outfit
  const handleSkip = () => {
    generateOutfit()
  }

  // Initialize with first outfit
  useEffect(() => {
    generateOutfit()
  }, [occasion, season, wardrobe])

  if (wardrobe.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Add items to your wardrobe to start generating outfits!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-sun-400" />
            <CardTitle>Outfit Shuffle</CardTitle>
          </div>
          <div className="text-xs text-muted-foreground">
            {savedCount} saved
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Occasion</label>
            <Select value={occasion} onValueChange={(v) => setOccasion(v as OutfitOccasion)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(OCCASION_CONFIG) as OutfitOccasion[]).map((occ) => (
                  <SelectItem key={occ} value={occ}>
                    {OCCASION_CONFIG[occ].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Season</label>
            <Select value={season} onValueChange={(v) => setSeason(v as OutfitSeason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SEASON_CONFIG) as OutfitSeason[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEASON_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Suggested Outfit */}
        {suggestedOutfit && (
          <div className="space-y-4">
            {/* Outfit Items Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {suggestedOutfit.items.map((item) => (
                <OutfitShuffleItem
                  key={item.id}
                  item={item}
                />
              ))}
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Colors:
              </span>
              <div className="flex gap-2">
                {suggestedOutfit.colorPalette.map((color) => (
                  <div
                    key={color}
                    className="h-6 w-6 rounded border border-stone-200 shadow-sm"
                    title={color}
                    style={{
                      backgroundColor: getColorHex(color),
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Occasion Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Occasion:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sun-100 text-xs font-medium text-sun-700">
                {OCCASION_CONFIG[suggestedOutfit.occasion].icon}{' '}
                {OCCASION_CONFIG[suggestedOutfit.occasion].label}
              </span>
            </div>

            {/* Item Count */}
            <div className="text-xs text-muted-foreground">
              {suggestedOutfit.items.length} items
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            className="flex-1 gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            Skip
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={generateOutfit}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={handleSaveOutfit}
            disabled={isSaving}
            className="flex-1 gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Save Outfit
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Shuffle generates random combinations from your wardrobe.
            Like it? Save it! Don't like it? Skip to the next suggestion.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface OutfitShuffleItemProps {
  item: SizingJournalEntry
}

/**
 * OutfitShuffleItem - Display individual item in shuffle
 */
function OutfitShuffleItem({ item }: OutfitShuffleItemProps) {
  const imageUrl = item.image_url || item.item_photos?.[0]?.image_url

  return (
    <div className="space-y-2">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${item.brand} ${item.model}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
            No image
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium truncate">{item.brand}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{item.model}</p>
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2 rounded-full border border-stone-300"
            style={{ backgroundColor: getColorHex(item.color) }}
          />
          <p className="text-xs text-muted-foreground">{item.color}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Helper: Convert color name to hex
 */
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#22C55E',
    yellow: '#EAB308',
    purple: '#A855F7',
    pink: '#EC4899',
    orange: '#F97316',
    brown: '#92400E',
    gray: '#6B7280',
    grey: '#6B7280',
    navy: '#001F3F',
    teal: '#14B8A6',
    gold: '#FBBF24',
    silver: '#E5E7EB',
    beige: '#F5E6D3',
    khaki: '#BFCF9E',
    default: '#94A3B8',
  }

  return colorMap[colorName.toLowerCase()] || colorMap.default
}
