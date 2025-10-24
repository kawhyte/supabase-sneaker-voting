'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  CatLoadingAnimation,
  CatLoadingSpinner,
  CatLoadingCardSkeleton,
  LoadingFallback,
} from '@/components/cat-loading-animation'

export default function LoadingTestPage() {
  const [activeType, setActiveType] = useState<'organizing' | 'searching' | 'napping'>('organizing')

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/test-phase-5">
            <Button variant="outline" className="mb-4">
              ← Back to Phase 5 Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            😺 Cat Loading Animations
          </h1>
          <p className="text-muted-foreground">
            Test 3 cat loading animation types
          </p>
        </div>

        {/* Type Selector */}
        <div className="mb-8 flex gap-2">
          <Button
            onClick={() => setActiveType('organizing')}
            className={`flex-1 ${activeType === 'organizing' ? 'bg-sun-400 hover:bg-sun-600' : ''}`}
            variant={activeType === 'organizing' ? 'default' : 'outline'}
          >
            🧹 Organizing
          </Button>
          <Button
            onClick={() => setActiveType('searching')}
            className={`flex-1 ${activeType === 'searching' ? 'bg-sun-400 hover:bg-sun-600' : ''}`}
            variant={activeType === 'searching' ? 'default' : 'outline'}
          >
            🔍 Searching
          </Button>
          <Button
            onClick={() => setActiveType('napping')}
            className={`flex-1 ${activeType === 'napping' ? 'bg-sun-400 hover:bg-sun-600' : ''}`}
            variant={activeType === 'napping' ? 'default' : 'outline'}
          >
            😴 Napping
          </Button>
        </div>

        {/* Full Screen Loading */}
        <div className="mb-12 border-2 border-dashed border-muted-foreground rounded-lg p-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Full-Screen Loading</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use when loading major features (outfit studio, etc.)
          </p>
          <div className="min-h-80 bg-white rounded-lg border border-stone-200 flex items-center justify-center">
            <CatLoadingAnimation type={activeType} />
          </div>
        </div>

        {/* Inline Spinner */}
        <div className="mb-12 border-2 border-dashed border-muted-foreground rounded-lg p-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Inline Spinner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use for smaller, in-context loading states
          </p>
          <div className="space-y-6">
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <h3 className="font-medium text-sm text-foreground mb-2">Small</h3>
              <CatLoadingSpinner size="sm" />
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <h3 className="font-medium text-sm text-foreground mb-2">Medium (default)</h3>
              <CatLoadingSpinner size="md" />
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <h3 className="font-medium text-sm text-foreground mb-2">Large</h3>
              <CatLoadingSpinner size="lg" />
            </div>
          </div>
        </div>

        {/* Skeleton Loaders */}
        <div className="mb-12 border-2 border-dashed border-muted-foreground rounded-lg p-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Card Skeleton</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use as placeholder while loading card content
          </p>
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <CatLoadingCardSkeleton />
          </div>
        </div>

        {/* Suspense Fallback */}
        <div className="mb-12 border-2 border-dashed border-muted-foreground rounded-lg p-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Suspense Fallback</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use with React Suspense boundaries for code splitting
          </p>
          <div className="bg-white rounded-lg border border-stone-200">
            <LoadingFallback type={activeType} />
          </div>
        </div>

        {/* Testing Checklist */}
        <div className="p-6 bg-sun-50 border-2 border-sun-300 rounded-lg mb-6">
          <h3 className="font-semibold text-foreground mb-3">✅ Testing Checklist</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>☐ Each type button switches animations</li>
            <li>☐ Full-screen loading emoji bounces smoothly</li>
            <li>☐ Messages rotate every ~1.5 seconds</li>
            <li>☐ Loading dots animate in sequence</li>
            <li>☐ Inline spinners show correct sizes</li>
            <li>☐ Spinner styles scale proportionally</li>
            <li>☐ Skeleton cards pulse smoothly</li>
            <li>☐ Suspense fallback displays correctly</li>
            <li>☐ No jank or stuttering in animations</li>
            <li>☐ No console errors</li>
            <li>☐ Responsive on mobile (375px)</li>
            <li>☐ Responsive on desktop (1440px)</li>
          </ul>
        </div>

        {/* Animation Details */}
        <div className="p-4 bg-muted rounded-lg mb-6">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Animation Details</h4>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">🧹 Organizing</p>
              <p>Message: "Organizing your closet..."</p>
              <p>Rotating: Hanging up tops → Organizing by color → Arranging shoes</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">🔍 Searching</p>
              <p>Message: "Finding the perfect outfit..."</p>
              <p>Rotating: Searching wardrobe → Checking compatibility → Creating magic</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">😴 Napping</p>
              <p>Message: "PurrView is loading..."</p>
              <p>Rotating: Waking up the cat → Preparing wardrobe → Almost there</p>
            </div>
          </div>
        </div>

        {/* Performance Notes */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Performance:</strong> These animations use CSS and JavaScript timers,
            not Lottie. For production, replace emoji-based animations with Lottie JSON files
            (see Phase 5 guide) for better performance and visual polish.
          </p>
        </div>
      </div>
    </main>
  )
}
