'use client'

import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface MilestoneCelebration {
  type:
    | 'outfit_created'
    | 'five_outfits'
    | 'ten_outfits'
    | 'outfit_worn'
    | 'cost_per_wear_achieved'
    | 'wish_item_purchased'
    | 'wardrobe_goal'
  title: string
  description: string
  emoji: string
  catMessage: string
}

const MILESTONES: Record<string, MilestoneCelebration> = {
  outfit_created: {
    type: 'outfit_created',
    title: 'First Outfit Created! 🎉',
    description: 'You\'re already creating magic! Your first outfit is ready to wear.',
    emoji: '🎨',
    catMessage: 'Meow! I\'m so proud of you! 😻',
  },
  five_outfits: {
    type: 'five_outfits',
    title: 'Outfit Creator! 🌟',
    description: 'You\'ve created 5 outfits! You\'re becoming a styling expert.',
    emoji: '✨',
    catMessage: 'Five outfits?! You\'re incredible! 🐾',
  },
  ten_outfits: {
    type: 'ten_outfits',
    title: 'Fashion Visionary! 👑',
    description: 'Ten outfits created! You\'re a true wardrobe curator.',
    emoji: '👑',
    catMessage: 'You\'re a fashion genius! Bow down! 😻',
  },
  outfit_worn: {
    type: 'outfit_worn',
    title: 'Outfit Worn! 👟',
    description: 'Great job wearing an outfit you created! You\'re making conscious choices.',
    emoji: '👟',
    catMessage: 'I hope you looked amazing! 🐱',
  },
  cost_per_wear_achieved: {
    type: 'cost_per_wear_achieved',
    title: 'Cost-Per-Wear Goal Achieved! 💰',
    description: 'This item is earning its keep in your wardrobe!',
    emoji: '💰',
    catMessage: 'That\'s what I call value for money! 💎',
  },
  wish_item_purchased: {
    type: 'wish_item_purchased',
    title: 'New Purchase! 🛍️',
    description: 'Welcome your new piece to the wardrobe! Let\'s find outfits for it.',
    emoji: '🛍️',
    catMessage: 'Time to create outfits with your new find! 🎉',
  },
  wardrobe_goal: {
    type: 'wardrobe_goal',
    title: 'Wardrobe Goal Achieved! 🏆',
    description: 'You\'ve reached a major milestone in your wardrobe journey!',
    emoji: '🏆',
    catMessage: 'You\'re unstoppable! 🚀',
  },
}

export function MilestoneCelebrationModal({
  isOpen,
  milestone,
  onClose,
}: {
  isOpen: boolean
  milestone: MilestoneCelebration | null
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      // Trigger confetti animation
      triggerConfetti(canvasRef.current)
    }
  }, [isOpen])

  const triggerConfetti = (canvas: HTMLCanvasElement) => {
    const confettiInstance = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    })

    // Celebrate!
    confettiInstance({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFC700', '#0F172A', '#FFFFFF', '#E6B300'],
    })

    // Secondary burst
    setTimeout(() => {
      confettiInstance({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.1, y: 0.5 },
        colors: ['#FFC700', '#0F172A'],
      })
    }, 100)

    // Third burst
    setTimeout(() => {
      confettiInstance({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.9, y: 0.5 },
        colors: ['#FFC700', '#FFFFFF'],
      })
    }, 200)
  }

  if (!milestone) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        <div className="flex flex-col items-center justify-center py-8 px-4">
          {/* Emoji */}
          <div className="text-7xl mb-6 animate-bounce">{milestone.emoji}</div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground mb-3">
            {milestone.title}
          </h2>

          {/* Description */}
          <p className="text-center text-muted-foreground mb-6">
            {milestone.description}
          </p>

          {/* Cat Message */}
          <div className="bg-sun-200 rounded-lg p-4 mb-6 w-full">
            <p className="text-center text-sm font-medium text-foreground">
              🐾 {milestone.catMessage}
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-sun-400 hover:bg-sun-600 text-foreground"
          >
            Thanks! Let's Keep Going
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to trigger milestone celebrations
 */
export function useMilestoneCelebration() {
  const [isOpen, setIsOpen] = useState(false)
  const [milestone, setMilestone] = useState<MilestoneCelebration | null>(null)

  const celebrate = (milestoneType: keyof typeof MILESTONES) => {
    const selectedMilestone = MILESTONES[milestoneType]
    if (selectedMilestone) {
      setMilestone(selectedMilestone)
      setIsOpen(true)
    }
  }

  const closeCelebration = () => {
    setIsOpen(false)
    // Clear milestone after animation
    setTimeout(() => setMilestone(null), 300)
  }

  return {
    isOpen,
    milestone,
    celebrate,
    closeCelebration,
  }
}
