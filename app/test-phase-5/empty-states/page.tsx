'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  WardrobeEmptyState,
  WishlistEmptyState,
  OutfitsEmptyState,
  ArchiveEmptyState,
  SearchEmptyState,
} from '@/components/empty-state-illustrations'

export default function EmptyStatesTestPage() {
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
            📦 Empty State Illustrations
          </h1>
          <p className="text-muted-foreground">
            Test all 5 empty state variations
          </p>
        </div>

        {/* Empty States Grid */}
        <div className="space-y-12">
          {/* Wardrobe Empty */}
          <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">1️⃣</span>
              <h2 className="text-xl font-semibold text-foreground">
                Wardrobe Empty
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Shows when user has 0 owned items
            </p>
            <div className="bg-white rounded-lg border border-stone-200">
              <WardrobeEmptyState />
            </div>
          </div>

          {/* Wishlist Empty */}
          <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">2️⃣</span>
              <h2 className="text-xl font-semibold text-foreground">
                Wishlist Empty
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Shows when user has 0 wishlist items
            </p>
            <div className="bg-white rounded-lg border border-stone-200">
              <WishlistEmptyState />
            </div>
          </div>

          {/* Outfits Empty */}
          <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">3️⃣</span>
              <h2 className="text-xl font-semibold text-foreground">
                Outfits Empty
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Shows when user has created 0 outfits
            </p>
            <div className="bg-white rounded-lg border border-stone-200">
              <OutfitsEmptyState
                onCreateOutfit={() => alert('Create outfit clicked!')}
              />
            </div>
          </div>

          {/* Archive Empty */}
          <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">4️⃣</span>
              <h2 className="text-xl font-semibold text-foreground">
                Archive Empty
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Shows when user has 0 archived items
            </p>
            <div className="bg-white rounded-lg border border-stone-200">
              <ArchiveEmptyState />
            </div>
          </div>

          {/* Search Empty */}
          <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">5️⃣</span>
              <h2 className="text-xl font-semibold text-foreground">
                Search Empty
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Shows when search returns no results
            </p>
            <div className="bg-white rounded-lg border border-stone-200">
              <SearchEmptyState query="blue sweater" />
            </div>
          </div>
        </div>

        {/* Testing Checklist */}
        <div className="mt-12 p-6 bg-sun-50 border-2 border-sun-300 rounded-lg">
          <h3 className="font-semibold text-foreground mb-3">✅ Testing Checklist</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>☐ All emojis display correctly and centered</li>
            <li>☐ Titles are bold and properly sized</li>
            <li>☐ Descriptions provide helpful context</li>
            <li>☐ Buttons have correct sun-400 styling</li>
            <li>☐ Buttons are clickable</li>
            <li>☐ Layout is responsive on mobile (375px)</li>
            <li>☐ Layout is responsive on tablet (768px)</li>
            <li>☐ Layout is responsive on desktop (1440px)</li>
            <li>☐ No console errors or warnings</li>
            <li>☐ Text contrast is readable (WCAG AAA)</li>
          </ul>
        </div>

        {/* Notes */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Integration Notes:</strong> These components should be used as fallback UI
            when list data is empty. Example: In wardrobe dashboard, render{' '}
            <code className="bg-white px-1 rounded text-foreground">&lt;WardrobeEmptyState /&gt;</code>
            {' '}when<code className="bg-white px-1 rounded text-foreground">items.length === 0</code>
          </p>
        </div>
      </div>
    </main>
  )
}
