import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Test page for Phase 5 components
 * Navigate to /test-phase-5 to test all components
 */
export default function Phase5TestPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🐾 Phase 5 Testing Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Test all new Delightful UX Polish components
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empty States Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📦</span>
                Empty States
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test all 5 empty state variations (wardrobe, wishlist, outfits, archive, search)
              </p>
              <Button asChild className="w-full bg-sun-400 hover:bg-sun-600">
                <Link href="/test-phase-5/empty-states">View Demo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Milestone Celebrations Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎉</span>
                Milestone Celebrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test confetti animations and 7 milestone types with canvas effects
              </p>
              <Button asChild className="w-full bg-sun-400 hover:bg-sun-600">
                <Link href="/test-phase-5/milestones">View Demo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Shopping Nudge Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🛍️</span>
                Instead of Shopping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test shopping impulse nudges with 8 random cat quotes
              </p>
              <Button asChild className="w-full bg-sun-400 hover:bg-sun-600">
                <Link href="/test-phase-5/shopping-nudge">View Demo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Wear Reminders Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>👕</span>
                Wear Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test unworn item reminders with different wear thresholds
              </p>
              <Button asChild className="w-full bg-sun-400 hover:bg-sun-600">
                <Link href="/test-phase-5/wear-reminders">View Demo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Seasonal Suggestions Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🌸</span>
                Seasonal Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test seasonal recommendations (auto-detects current season)
              </p>
              <Button asChild className="w-full bg-sun-400 hover:bg-sun-600">
                <Link href="/test-phase-5/seasonal">View Demo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Cat Loading Animations Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>😺</span>
                Cat Loading Animations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test 3 loading states (organizing, searching, napping)
              </p>
              <Button asChild className="w-full bg-sun-400 hover:bg-sun-600">
                <Link href="/test-phase-5/loading">View Demo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Testing Guide */}
        <Card className="mt-12 border-2 border-sun-300 bg-sun-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📖</span>
              Full Testing Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              For detailed testing instructions and integration checklist, see:
            </p>
            <code className="block bg-white p-3 rounded border border-stone-300 text-xs mb-4 text-foreground">
              docs/PHASE_5_TESTING_GUIDE.md
            </code>
            <p className="text-xs text-muted-foreground">
              Contains: component usage examples, mock data, integration checklist, troubleshooting
            </p>
          </CardContent>
        </Card>

        {/* Quick Status */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-3">✅ Phase 5 Status</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ Empty state illustrations - 6 components</li>
            <li>✅ Milestone celebrations - confetti with 7 types</li>
            <li>✅ Shopping nudge modal - 8 cat quotes</li>
            <li>✅ Wear reminders - intelligent thresholds</li>
            <li>✅ Seasonal suggestions - auto-detecting seasons</li>
            <li>✅ Cat loading animations - 3 animation types</li>
            <li>✅ TypeScript compilation - 0 errors</li>
            <li>✅ Production build - passing</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
