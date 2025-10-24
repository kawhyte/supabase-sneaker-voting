'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InsteadOfShoppingModal } from '@/components/instead-of-shopping-modal'

export default function ShoppingNudgeTestPage() {
  const [isOpen, setIsOpen] = useState(false)

  const activities = [
    {
      label: 'Create an Outfit',
      hint: 'Mix and match pieces you already own',
      action: () => {
        alert('🎨 Opening outfit studio...')
        setIsOpen(false)
      },
    },
    {
      label: 'Clean Your Closet',
      hint: 'You might rediscover forgotten favorites',
      action: () => {
        alert('🧹 Opening wardrobe organization...')
        setIsOpen(false)
      },
    },
    {
      label: 'Shuffle Outfits',
      hint: 'Try random outfit suggestions',
      action: () => {
        alert('🔄 Opening shuffle feature...')
        setIsOpen(false)
      },
    },
    {
      label: 'Check Cost-Per-Wear',
      hint: 'See which items are earning their keep',
      action: () => {
        alert('💰 Opening wear statistics...')
        setIsOpen(false)
      },
    },
  ]

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
            🛍️ Instead of Shopping Modal
          </h1>
          <p className="text-muted-foreground">
            Test shopping impulse nudges with 8 random cat quotes
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-sun-50 border-2 border-sun-300 rounded-lg">
          <p className="text-sm text-foreground mb-3">
            This modal appears when users try to shop, gently suggesting alternative activities instead.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Real usage:</strong> This would be triggered automatically once per day on app load,
            or when user navigates to wishlist/add item view.
          </p>
        </div>

        {/* Test Buttons */}
        <div className="space-y-4 mb-8">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full bg-sun-400 hover:bg-sun-600 text-foreground h-12 text-base"
          >
            Open Shopping Nudge Modal
          </Button>

          <Button
            onClick={() => {
              localStorage.removeItem('last_shopping_prompt_date')
              alert('✅ Cleared localStorage daily limit!\nNow you can test the daily frequency.')
            }}
            variant="outline"
            className="w-full"
          >
            Clear Daily Limit (test localStorage)
          </Button>
        </div>

        {/* Modal */}
        <InsteadOfShoppingModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          activities={activities}
        />

        {/* Testing Checklist */}
        <div className="p-6 bg-sun-50 border-2 border-sun-300 rounded-lg mb-6">
          <h3 className="font-semibold text-foreground mb-3">✅ Testing Checklist</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>☐ Modal opens when button clicked</li>
            <li>☐ Modal displays one cat quote (random selection)</li>
            <li>☐ Emoji is visible and animated</li>
            <li>☐ 4 activity cards display with descriptions</li>
            <li>☐ Clicking activity card triggers action and closes modal</li>
            <li>☐ "I'll browse anyway" button closes modal without action</li>
            <li>☐ X button in top-right closes modal</li>
            <li>☐ Cat message displays in highlighted box</li>
            <li>☐ Different quote each time modal opens (after clearing localStorage)</li>
            <li>☐ Modal is centered on screen</li>
            <li>☐ Modal has proper backdrop overlay</li>
          </ul>
        </div>

        {/* Quote Rotation Test */}
        <div className="p-4 bg-muted rounded-lg mb-6">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Quote Rotation Test</h4>
          <ol className="space-y-2 text-xs text-muted-foreground">
            <li>1. Click "Clear Daily Limit" button</li>
            <li>2. Click "Open Shopping Nudge" button multiple times</li>
            <li>3. Each time, you should see a different cat quote (8 total)</li>
            <li>4. Quotes should be random, not always the same</li>
            <li>5. Without clearing localStorage, modal shows same quote for 24 hours</li>
          </ol>
        </div>

        {/* Daily Frequency Note */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Daily Frequency:</strong> In production, the modal uses
            <code className="bg-white px-1 rounded text-blue-900">{' '}useInsteadOfShoppingModal()</code>
            hook which only shows once per calendar day via localStorage tracking.
            This prevents modal fatigue while still providing gentle nudges.
          </p>
        </div>

        {/* Activities Reference */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Activities (8 cat quotes)</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>✨ "Why shop when you can create?"</li>
            <li>📦 "Organize first, shop later!"</li>
            <li>🔄 "Every closet needs a refresh. Let&apos;s shuffle!"</li>
            <li>👗 "The best purchase is wearing what you have."</li>
            <li>💭 "Before buying, style it first!"</li>
            <li>⏰ "Patience is a virtue, and so is good style."</li>
            <li>🎯 "A curated wardrobe beats a crowded closet."</li>
            <li>💎 "Great style is about wearing less, not buying more."</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
