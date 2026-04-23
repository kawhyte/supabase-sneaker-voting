'use client'

import { AlertTriangle, AlertCircle, Minus, Check, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComfortRatingProps {
  value?: number | null
  onChange: (value: number) => void
  error?: string
  disabled?: boolean
}

const comfortLevels = [
  { id: 1, label: 'Unwearable', icon: AlertTriangle },
  { id: 2, label: 'Uncomfortable', icon: AlertCircle },
  { id: 3, label: 'Neutral', icon: Minus },
  { id: 4, label: 'Comfortable', icon: Check },
  { id: 5, label: 'Perfect', icon: Star },
]

export function ComfortRating({
  value,
  onChange,
  error,
  disabled = false,
}: ComfortRatingProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        {comfortLevels.map((level) => {
          const Icon = level.icon
          const isSelected = value === level.id

          return (
            <button
              key={level.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(level.id)}
              aria-pressed={isSelected}
              aria-label={level.label}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                isSelected
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate hidden sm:inline">{level.label}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      <p className="text-xs text-slate-500">
        Select how comfortable the item felt when you tried it on.
      </p>
    </div>
  )
}
