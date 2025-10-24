'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  MilestoneCelebrationModal,
  useMilestoneCelebration,
} from '@/components/milestone-celebration'

export default function MilestonesTestPage() {
  const { isOpen, milestone, celebrate, closeCelebration } = useMilestoneCelebration()

  const milestoneTypes = [
    { id: 'outfit_created', label: 'First Outfit Created' },
    { id: 'five_outfits', label: '5 Outfits Created' },
    { id: 'ten_outfits', label: '10 Outfits Created' },
    { id: 'outfit_worn', label: 'Outfit Worn' },
    { id: 'cost_per_wear_achieved', label: 'Cost Per Wear Goal' },
    { id: 'wish_item_purchased', label: 'Wishlist Item Purchased' },
    { id: 'wardrobe_goal', label: 'Wardrobe Goal Achieved' },
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
            🎉 Milestone Celebrations
          </h1>
          <p className="text-muted-foreground">
            Test confetti animations and celebration messages (7 types)
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-sun-50 border-2 border-sun-300 rounded-lg">
          <p className="text-sm text-foreground">
            Click any milestone button below to trigger the celebration modal with confetti animation.
            Try clicking different ones to see different messages and cat reactions!
          </p>
        </div>

        {/* Milestone Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {milestoneTypes.map((milestone) => (
            <Button
              key={milestone.id}
              onClick={() => celebrate(milestone.id as any)}
              className="bg-sun-400 hover:bg-sun-600 text-foreground h-14 text-base"
            >
              {milestone.label}
            </Button>
          ))}
        </div>

        {/* Current Status */}
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {isOpen ? (
              <>
                <strong className="text-foreground">Celebration active:</strong> {milestone?.title}
              </>
            ) : (
              'Select a milestone above to trigger celebration'
            )}
          </p>
        </div>

        {/* Milestone Modal */}
        <MilestoneCelebrationModal
          isOpen={isOpen}
          milestone={milestone}
          onClose={closeCelebration}
        />

        {/* Testing Checklist */}
        <div className="p-6 bg-sun-50 border-2 border-sun-300 rounded-lg">
          <h3 className="font-semibold text-foreground mb-3">✅ Testing Checklist</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>☐ Confetti animation triggers on button click</li>
            <li>☐ Confetti has 3 burst patterns (center, left, right)</li>
            <li>☐ Confetti colors are brand colors (sun-400, sun-600, white, slate-900)</li>
            <li>☐ Modal displays correct title for each milestone type</li>
            <li>☐ Modal displays descriptive message</li>
            <li>☐ Cat message displays (starts with 🐾)</li>
            <li>☐ Emoji bounces in modal header</li>
            <li>☐ "Thanks! Let's Keep Going" button closes modal</li>
            <li>☐ Confetti stops after ~2 seconds (cleanup)</li>
            <li>☐ Modal can be clicked multiple times</li>
            <li>☐ No console errors (check DevTools)</li>
          </ul>
        </div>

        {/* Confetti Details */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Confetti Details</h4>
          <ul className="space-y-1 text-xs text-muted-foreground font-mono">
            <li>• 100 particles center burst + 50 particles left + 50 particles right</li>
            <li>• Spread: 70° (center), 60° (sides)</li>
            <li>• Colors: #FFC700 (sun-400), #0F172A (slate-900), #FFFFFF, #E6B300 (sun-600)</li>
            <li>• Timing: 0ms center, 100ms left, 200ms right (staggered)</li>
          </ul>
        </div>

        {/* Performance Note */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Performance Note:</strong> Canvas-confetti uses a Web Worker for confetti animation,
            so it shouldn&apos;t impact app performance. You can verify this in DevTools Performance tab.
          </p>
        </div>
      </div>
    </main>
  )
}
