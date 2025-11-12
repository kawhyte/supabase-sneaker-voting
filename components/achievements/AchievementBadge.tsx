'use client'

import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'

interface AchievementBadgeProps {
  id: string
  name: string
  icon: LucideIcon
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  isUnlocked: boolean
  progress?: number // 0-100
  onClick: () => void
  tabIndex?: number
  description?: string
}

export const AchievementBadge = forwardRef<HTMLButtonElement, AchievementBadgeProps>(
  (
    {
      name,
      icon: IconComponent,
      isUnlocked,
      progress = 0,
      onClick,
      tabIndex,
      description,
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        tabIndex={tabIndex}
        onClick={onClick}
        className={`
          flex flex-col items-center gap-2 p-3 rounded-lg text-center transition-all
          hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isUnlocked
            ? 'bg-primary/20'
            : 'bg-gray-200 dark:bg-gray-800 opacity-50'
          }
        `}
        aria-label={`${name} achievement ${isUnlocked ? 'unlocked' : 'locked'}`}
      >
        {/* Icon */}
        <div className={`
          flex items-center justify-center w-16 h-16 rounded-full
          ${isUnlocked
            ? 'bg-primary/30'
            : 'bg-gray-300 dark:bg-gray-700'
          }
        `}>
          <IconComponent className={`w-8 h-8 ${isUnlocked ? 'text-primary' : 'text-gray-600 dark:text-gray-500'}`} />
        </div>

        {/* Name */}
        <p className="text-sm font-bold text-foreground line-clamp-2">
          {name}
        </p>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Progress Bar (if applicable) */}
        {progress !== undefined && progress < 100 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
              aria-label={`${progress}% complete`}
            />
          </div>
        )}
      </button>
    )
  },
)

AchievementBadge.displayName = 'AchievementBadge'
