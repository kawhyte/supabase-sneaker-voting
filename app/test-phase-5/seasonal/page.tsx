'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  SeasonalSuggestionsCard,
  getCurrentSeason,
  type Season,
} from '@/components/seasonal-suggestions'

export default function SeasonalTestPage() {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring')

  useEffect(() => {
    setCurrentSeason(getCurrentSeason())
  }, [])

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/test-phase-5">
            <Button variant="outline" className="mb-4">
              ← Back to Phase 5 Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🌸 Seasonal Suggestions
          </h1>
          <p className="text-muted-foreground">
            Test season-aware wardrobe recommendations
          </p>
        </div>

        {/* Current Season Info */}
        <div className="mb-8 p-4 bg-sun-50 border-2 border-sun-300 rounded-lg">
          <p className="text-sm text-foreground">
            <strong>Detected current season:</strong> {currentSeason.toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on current date and month. If testing other seasons, see instructions below.
          </p>
        </div>

        {/* Seasonal Card */}
        <div className="mb-8">
          <SeasonalSuggestionsCard
            onViewOutfits={() => alert('🎨 Opening outfit studio...')}
            onOrganizeWardrobe={() => alert('🧹 Opening wardrobe...')}
          />
        </div>

        {/* Testing Checklist */}
        <div className="p-6 bg-sun-50 border-2 border-sun-300 rounded-lg mb-6">
          <h3 className="font-semibold text-foreground mb-3">✅ Testing Checklist</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>☐ Card shows correct season emoji</li>
            <li>☐ Card shows correct season title</li>
            <li>☐ Seasonal message is relevant</li>
            <li>☐ 4 bullet-point suggestions display</li>
            <li>☐ Suggestions are season-appropriate</li>
            <li>☐ Category badges display (color-coded)</li>
            <li>☐ "Create Outfit" button is clickable</li>
            <li>☐ "Organize" button is clickable</li>
            <li>☐ Buttons trigger appropriate alerts</li>
            <li>☐ Card is responsive on mobile (375px)</li>
            <li>☐ Card is responsive on desktop (1440px)</li>
          </ul>
        </div>

        {/* Season Reference */}
        <div className="p-4 bg-muted rounded-lg mb-6">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Season Reference</h4>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">🌸 Spring (Feb-Apr)</p>
              <p>Light layers, pastels, transition to summer</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">☀️ Summer (May-Jul)</p>
              <p>Breathable fabrics, minimal layers, bright colors</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">🍂 Fall (Aug-Oct)</p>
              <p>Cozy layers, earth tones, boots and cardigans</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">❄️ Winter (Nov-Jan)</p>
              <p>Heavy coats, warm knits, winter accessories</p>
            </div>
          </div>
        </div>

        {/* Testing Other Seasons */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">Testing Other Seasons</h4>
          <p className="text-xs text-blue-900 mb-3">
            To manually test other seasons, temporarily modify getCurrentSeason() in
            <code className="bg-white px-1 rounded text-blue-900"> components/seasonal-suggestions.tsx</code>:
          </p>
          <pre className="text-xs bg-white p-2 rounded border border-blue-200 text-blue-900 overflow-auto">
{`// Temporarily change:
export function getCurrentSeason(): Season {
  return 'summer'; // Change to: 'spring', 'summer', 'fall', 'winter'

  // Original code below (comment out above line):
  const now = new Date()
  const month = now.getMonth()
  // ... etc
}`}
          </pre>
        </div>

        {/* localStorage Testing */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-foreground mb-2 text-sm">localStorage Management</h4>
          <p className="text-xs text-muted-foreground mb-3">
            The component tracks which season suggestion was last shown using localStorage.
            You can test this with:
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => {
                localStorage.removeItem('last_seasonal_suggestion')
                alert('✅ Cleared seasonal suggestion cache!\nNow the component will show suggestion again.')
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Clear Seasonal Suggestion Cache
            </Button>
            <Button
              onClick={() => {
                const value = localStorage.getItem('last_seasonal_suggestion')
                alert(`Current stored season: ${value || 'Not set'}`)
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              View Current Storage Value
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
