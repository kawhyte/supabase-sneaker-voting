'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

interface AchievementBadgeProps {
  id: string
  name: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  isUnlocked: boolean
  progress?: number // 0-100
  onClick: () => void
}

export function AchievementBadge({
  id,
  name,
  icon,
  tier,
  isUnlocked,
  progress = 0,
  onClick,
}: AchievementBadgeProps) {
  const tierColors = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
  }

  return (
    <motion.button
      whileHover={isUnlocked ? { scale: 1.05 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`relative p-6 rounded-lg border-2 transition-all ${
        isUnlocked
          ? 'bg-card border-sun-400 shadow-lg cursor-pointer'
          : 'bg-muted border-border opacity-60 cursor-default'
      }`}
      aria-label={`${name} - ${isUnlocked ? 'Unlocked' : 'Locked'}`}
    >
      {/* Icon */}
      <div className="text-6xl mb-3">
        {isUnlocked ? icon : <Lock className="h-16 w-16 text-muted-foreground mx-auto" />}
      </div>

      {/* Name */}
      <div className="text-sm font-semibold text-center mb-2 line-clamp-2">
        {name}
      </div>

      {/* Tier Badge */}
      <div
        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${tierColors[tier]}`}
      >
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </div>

      {/* Progress Bar (if not unlocked and has progress) */}
      {!isUnlocked && progress > 0 && (
        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-sun-400 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center mt-1">
            {progress}% complete
          </div>
        </div>
      )}
    </motion.button>
  )
}
