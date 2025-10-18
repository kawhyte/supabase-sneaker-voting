'use client'

import { useState } from 'react'
import { AlertTriangle, AlertCircle, Minus, Check, Star } from 'lucide-react'

interface ComfortRatingProps {
  value?: number | null
  onChange: (value: number) => void
  error?: string
  disabled?: boolean
}

const comfortLevels = [
  {
    id: 1,
    label: 'Unwearable',
    icon: AlertTriangle,
    description: 'Too tight/loose, poor fit',
  },
  {
    id: 2,
    label: 'Uncomfortable',
    icon: AlertCircle,
    description: 'Some discomfort',
  },
  {
    id: 3,
    label: 'Neutral',
    icon: Minus,
    description: 'Acceptable but not ideal',
  },
  {
    id: 4,
    label: 'Comfortable',
    icon: Check,
    description: 'Good fit and feel',
  },
  {
    id: 5,
    label: 'Perfect',
    icon: Star,
    description: 'Excellent comfort',
  },
]

export function ComfortRating({
  value,
  onChange,
  error,
  disabled = false,
}: ComfortRatingProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-900">Comfort Rating</label>
        {value && (
          <span className="text-xs font-medium text-sun-600">
            {comfortLevels.find(l => l.id === value)?.label}
          </span>
        )}
      </div>

      {/* Responsive Grid: 1 column on mobile, 5 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {comfortLevels.map(level => {
          const Icon = level.icon
          const isSelected = value === level.id
          const isHovered = hoveredId === level.id

          return (
            <button
              type="button"
              key={level.id}
              onClick={() => !disabled && onChange(level.id)}
              onMouseEnter={() => !disabled && setHoveredId(level.id)}
              onMouseLeave={() => setHoveredId(null)}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${level.label} - ${level.description}`}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-lg
                border-2 transition-all duration-300 ease-out
                min-h-[80px] justify-center
                ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-stone-50'
                }
                ${
                  isSelected
                    ? 'border-sun-400 bg-sun-50'
                    : 'border-stone-200 bg-white'
                }
                ${
                  isHovered && !isSelected
                    ? 'border-sun-300 shadow-sm'
                    : ''
                }
              `}
            >
              {/* Icon */}
              <Icon
                className={`w-6 h-6 transition-colors duration-300 ${
                  isSelected
                    ? 'text-sun-600'
                    : isHovered
                      ? 'text-slate-600'
                      : 'text-slate-400'
                }`}
              />

              {/* Label */}
              <div className="text-center space-y-1">
                <div
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isSelected
                      ? 'text-sun-600'
                      : isHovered
                        ? 'text-slate-700'
                        : 'text-slate-600'
                  }`}
                >
                  {level.label}
                </div>

                {/* Description (hidden on mobile to save space) */}
                <div className="hidden md:block text-[10px] text-slate-500 leading-tight">
                  {level.description}
                </div>
              </div>

              {/* Selected indicator ring */}
              {isSelected && (
                <div className="absolute inset-0 rounded-lg pointer-events-none border-2 border-sun-600 opacity-20" />
              )}
            </button>
          )
        })}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm font-medium text-destructive mt-2">
          {error}
        </p>
      )}

      {/* Helper text */}
      <p className="text-xs text-slate-500">
        Select how comfortable the item felt when you tried it on.
      </p>
    </div>
  )
}
