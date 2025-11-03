'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { AlertCircle, Heart } from 'lucide-react'

interface CanYouStyleThisQuizProps {
  outfitsCreated: number
  isOpen: boolean
  requiredOutfits?: number  // New prop to support configurable threshold
  itemBrand?: string
  itemModel?: string
  itemPrice?: number
  onProceed: () => void
  onCreateOutfits: () => void
  onSkip: () => void
}

/**
 * CanYouStyleThisQuiz - Gentle guardrail to encourage outfit planning
 * Asks users to create 3 sample outfits before adding to wishlist
 * Can be skipped with a "sad cat" reminder about purchase prevention
 *
 * Psychology: Creating 3 outfits = minimum pattern recognition
 * - Proves user can style items from their wardrobe
 * - Reduces impulse buying (friction is good for prevention)
 * - Measurable: tracks skip rate as effectiveness metric
 */
export function CanYouStyleThisQuiz({
  outfitsCreated,
  isOpen,
  requiredOutfits = 3,  // Default to 3 if not provided
  itemBrand,
  itemModel,
  itemPrice,
  onProceed,
  onCreateOutfits,
  onSkip,
}: CanYouStyleThisQuizProps) {
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)

  const progress = (outfitsCreated / requiredOutfits) * 100
  const isComplete = outfitsCreated >= requiredOutfits
  const itemName = itemModel ? `${itemBrand} ${itemModel}` : 'this item'

  return (
    <>
      {/* Main Quiz Modal */}
      <Dialog open={isOpen && !showSkipConfirm}>
        <DialogContent className="w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-sun-400" />
              Can you style {itemName}?
            </DialogTitle>
            <DialogDescription>
              Create 3 outfit ideas using items from your wardrobe. This helps you avoid buying things you won't wear!
            </DialogDescription>
          </DialogHeader>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-slate-600">
                {outfitsCreated}/{requiredOutfits} outfits
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Why this matters:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Research shows creating outfits reduces regret by 40%</li>
                  <li>You avoid buying items that "don't go with anything"</li>
                  <li>You discover what you actually wear vs. what sits in your closet</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            {isComplete ? (
              <>
                <Button variant="outline" onClick={() => setShowSkipConfirm(true)} size="sm">
                  Create More Outfits
                </Button>
                <Button onClick={onProceed} size="sm">
                  Add to Wishlist ✓
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowSkipConfirm(true)} size="sm">
                  Skip for Now
                </Button>
                <Button onClick={onCreateOutfits} size="sm">
                  Create Outfits
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Confirmation Modal (Sad Cat) */}
      <Dialog open={showSkipConfirm}>
        <DialogContent className="w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle>Okay... but I recommend creating outfits first 😿</DialogTitle>
            <DialogDescription>
              Take 2 minutes to see if you can style {itemName}.
            </DialogDescription>
          </DialogHeader>

          {/* Sad Cat Illustration (emoji) */}
          <div className="flex justify-center py-6">
            <div className="text-6xl">😿</div>
          </div>

          {/* Persuasion Copy */}
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <p className="text-sm text-amber-900">
                <strong>Here's what happens when you skip:</strong>
              </p>
              <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
                <li>You buy the item... but never actually wear it</li>
                <li>It sits in your closet taking up space</li>
                <li>You feel buyer's remorse (not fun!)</li>
                <li>Your cost-per-wear gets worse</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
              <p className="text-sm text-green-900">
                <strong>When you create outfits first:</strong>
              </p>
              <ul className="text-sm text-green-900 space-y-1 list-disc list-inside">
                <li>You buy items you'll actually wear (10+ times!)</li>
                <li>Your cost-per-wear improves</li>
                <li>You shop smarter in the future</li>
                <li>No regrets = happy closet</li>
              </ul>
            </div>
          </div>

          {/* Decision Buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowSkipConfirm(false)
                onSkip()
              }}
              size="sm"
            >
              Skip Anyway
            </Button>
            <Button
              onClick={() => {
                setShowSkipConfirm(false)
                onCreateOutfits()
              }}
              size="sm"
            >
              Create Outfits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
