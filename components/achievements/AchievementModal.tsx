'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AchievementDefinition } from '@/lib/achievement-definitions'
import { Check, Lock } from 'lucide-react'

interface AchievementModalProps {
  achievement: AchievementDefinition
  isUnlocked: boolean
  onClose: () => void
}

export function AchievementModal({ achievement, isUnlocked, onClose }: AchievementModalProps) {
  const IconComponent = achievement.icon
  const LockIcon = Lock

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="mb-4 flex justify-center">
              {isUnlocked ? (
                <IconComponent className="w-16 h-16 text-primary" />
              ) : (
                <LockIcon className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
            <div className="text-2xl font-bold">{achievement.name}</div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            {isUnlocked ? (
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <Check className="h-4 w-4" />
                <span className="font-medium">Unlocked!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-full">
                <Lock className="h-4 w-4" />
                <span className="font-medium">Locked</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-center text-muted-foreground">{achievement.description}</p>

          {/* Tier & Points */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="bg-muted px-3 py-1 rounded-full">
              <span className="font-medium">{achievement.tier}</span>
            </div>
            <div className="bg-sun-200 px-3 py-1 rounded-full">
              <span className="font-medium">{achievement.points} points</span>
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
