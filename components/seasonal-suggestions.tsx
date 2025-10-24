'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface SeasonalSuggestion {
  season: Season
  emoji: string
  title: string
  message: string
  suggestions: string[]
  recommendedCategories: string[]
}

const SEASONAL_SUGGESTIONS: Record<Season, SeasonalSuggestion> = {
  spring: {
    season: 'spring',
    emoji: '🌸',
    title: 'Spring Vibes!',
    message: 'Time to transition to lighter fabrics and brighter colors!',
    suggestions: [
      'Bring out light jackets and cardigans',
      'Mix in more pastels and bright colors',
      'Swap heavy boots for sneakers',
      'Create outfits with layers (it\'s still cool!)',
    ],
    recommendedCategories: ['tops', 'outerwear', 'sneakers', 'accessories'],
  },
  summer: {
    season: 'summer',
    emoji: '☀️',
    title: 'Summer Ready!',
    message: 'Time for breathable fabrics and minimal layers!',
    suggestions: [
      'Break out shorts, t-shirts, and sundresses',
      'Organize sandals and summer sneakers',
      'Create easy, quick outfits',
      'Mix in vacation looks for trips',
    ],
    recommendedCategories: ['tops', 'bottoms', 'accessories', 'bags'],
  },
  fall: {
    season: 'fall',
    emoji: '🍂',
    title: 'Fall is Here!',
    message: 'Embrace cozy layers and warm tones!',
    suggestions: [
      'Bring out sweaters and cardigans',
      'Introduce earth tones and jewel tones',
      'Organize boots and closed-toe shoes',
      'Create layered outfit combinations',
    ],
    recommendedCategories: ['outerwear', 'tops', 'bottoms', 'sneakers'],
  },
  winter: {
    season: 'winter',
    emoji: '❄️',
    title: 'Winter Style!',
    message: 'Time for cozy, warm layering!',
    suggestions: [
      'Prep heavy coats and winter accessories',
      'Organize warm knits and long sleeves',
      'Create thermal-friendly outfits',
      'Mix textures for visual interest',
    ],
    recommendedCategories: ['outerwear', 'tops', 'accessories', 'bags'],
  },
}

/**
 * Detect current season based on date
 */
export function getCurrentSeason(): Season {
  const now = new Date()
  const month = now.getMonth() // 0-11

  if (month >= 2 && month < 5) return 'spring'
  if (month >= 5 && month < 8) return 'summer'
  if (month >= 8 && month < 11) return 'fall'
  return 'winter'
}

/**
 * Get seasonal suggestions card
 */
export function SeasonalSuggestionsCard({
  onViewOutfits,
  onOrganizeWardrobe,
}: {
  onViewOutfits?: () => void
  onOrganizeWardrobe?: () => void
}) {
  const [season, setSeason] = useState<Season>('spring')

  useEffect(() => {
    setSeason(getCurrentSeason())
  }, [])

  const suggestion = SEASONAL_SUGGESTIONS[season]

  return (
    <Card className="border-2 border-sun-300 bg-gradient-to-br from-sun-50 to-blaze-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{suggestion.emoji}</div>
          <div>
            <CardTitle className="text-lg">{suggestion.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{suggestion.message}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Suggestions List */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            What to do this season:
          </p>
          <ul className="space-y-2">
            {suggestion.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-sun-400 font-bold">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Categories */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Focus on these categories:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestion.recommendedCategories.map((category) => (
              <span
                key={category}
                className="inline-block px-3 py-1 bg-sun-200 text-foreground text-xs font-medium rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewOutfits && (
            <Button
              onClick={onViewOutfits}
              size="sm"
              className="bg-sun-400 hover:bg-sun-600 text-foreground flex-1"
            >
              Create Outfit
            </Button>
          )}
          {onOrganizeWardrobe && (
            <Button
              onClick={onOrganizeWardrobe}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Organize
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Filter wardrobe items by season recommendations
 */
export function getSeasonalItems(
  items: SizingJournalEntry[],
  season: Season
): SizingJournalEntry[] {
  const suggestion = SEASONAL_SUGGESTIONS[season]
  return items.filter((item) =>
    suggestion.recommendedCategories.includes(item.category)
  )
}

/**
 * Get prompt to show seasonal suggestion
 */
export function useSeasonalSuggestion() {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring')
  const [lastShownSeason, setLastShownSeason] = useState<Season | null>(null)

  useEffect(() => {
    const season = getCurrentSeason()
    setCurrentSeason(season)

    // Check if we should show the seasonal suggestion
    const lastShown = localStorage.getItem('last_seasonal_suggestion')
    if (lastShown !== season) {
      setLastShownSeason(season)
      localStorage.setItem('last_seasonal_suggestion', season)
    }
  }, [])

  return {
    currentSeason,
    shouldShow: lastShownSeason !== null && lastShownSeason === currentSeason,
    suggestion: SEASONAL_SUGGESTIONS[currentSeason],
  }
}
