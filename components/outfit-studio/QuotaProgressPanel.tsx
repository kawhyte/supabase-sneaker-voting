'use client'

import { OutfitItem } from '@/components/types/outfit'
import { useOutfitQuotas } from '@/hooks/useOutfitQuotas'
import { CANONICAL_CATEGORIES, type CanonicalCategoryKey } from '@/types/CanonicalCategories'
import { getQuotaMessage } from '@/lib/quota-validation'
import { cn } from '@/lib/utils'
import { Sparkles, Check, Footprints, Shirt } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface QuotaProgressPanelProps {
  outfitItems: OutfitItem[]
  className?: string
}

/**
 * QuotaProgressPanel - Floating quota HUD (always visible)
 *
 * Features:
 * - Shows 4 canonical category quotas (Shoes, Tops, Bottoms, Outerwear)
 * - Visual progress indicators (0/1, 1/1 ✓)
 * - Color coding: Yellow when at limit, gray when available
 * - Icons for each category
 * - Tooltips with helpful messages
 * - Sticky positioning (stays visible while scrolling)
 * - Responsive: horizontal on desktop, stacked on mobile
 *
 * Design:
 * - Gradient background (sun-50 to amber-50)
 * - Bold border when quotas are filled
 * - Smooth transitions
 * - 8px grid spacing
 */
export function QuotaProgressPanel({ outfitItems, className }: QuotaProgressPanelProps) {
  const { quotaStatus } = useOutfitQuotas(outfitItems)

  // Get restricted categories only (Shoes, Tops, Bottoms - not Accessories)
  const restrictedCategories = Object.keys(CANONICAL_CATEGORIES).filter(
    (key) => CANONICAL_CATEGORIES[key as CanonicalCategoryKey].max !== null
  ) as CanonicalCategoryKey[]

  // Calculate total progress
  const totalSlots = restrictedCategories.reduce((sum, key) => {
    const config = CANONICAL_CATEGORIES[key]
    return sum + (config.max || 0)
  }, 0)

  const filledSlots = restrictedCategories.reduce((sum, key) => {
    const validation = quotaStatus.quotas[key]
    return sum + Math.min(validation?.current || 0, CANONICAL_CATEGORIES[key].max || 0)
  }, 0)

  const progressPercent = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0
  const isComplete = filledSlots >= totalSlots

  // Icon map for each category
  const iconMap: Record<string, React.ReactNode> = {
    SHOES: <Footprints className="h-4 w-4" aria-hidden="true" />,
    TOPS: <Shirt className="h-4 w-4" aria-hidden="true" />,
    BOTTOMS: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 3v18M16 3v18M3 8h18M3 16h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    OUTERWEAR: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  }

  return (
    <div
      className={cn(
        'sticky top-0 bg-gradient-to-r from-sun-50 to-amber-50 rounded-lg p-3 sm:p-4 shadow-sm z-10 transition-all duration-200',
        isComplete
          ? 'border-2 border-sun-400 shadow-md'
          : 'border-2 border-sun-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-sun-600" aria-hidden="true" />
          <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
            Outfit Progress
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">
            {outfitItems.length} {outfitItems.length === 1 ? 'item' : 'items'}
          </span>
          {isComplete && (
            <span className="text-xs font-medium text-sun-700 bg-sun-200 px-2 py-0.5 rounded-full">
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            isComplete ? 'bg-sun-600' : 'bg-sun-400'
          )}
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={filledSlots}
          aria-valuemin={0}
          aria-valuemax={totalSlots}
          aria-label={`Outfit progress: ${filledSlots} of ${totalSlots} items`}
        />
      </div>

      {/* Quota Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {restrictedCategories.map((canonicalKey) => {
          const validation = quotaStatus.quotas[canonicalKey]
          const config = CANONICAL_CATEGORIES[canonicalKey]
          const isAtLimit = validation?.isAtLimit && validation.current > 0
          const tooltipMessage = validation?.canAdd
            ? `Can add ${config.max! - (validation.current || 0)} more ${config.label.toLowerCase()}`
            : `${config.label} quota filled (${validation?.current}/${config.max})`

          return (
            <Tooltip key={canonicalKey}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'rounded-md border px-2 sm:px-3 py-2 text-xs cursor-help transition-all duration-200',
                    isAtLimit
                      ? 'border-sun-400 bg-sun-100 shadow-sm'
                      : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                  )}
                  aria-label={tooltipMessage}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={cn(
                      'flex-shrink-0',
                      isAtLimit ? 'text-sun-700' : 'text-slate-600'
                    )}>
                      {iconMap[canonicalKey] || iconMap.SHOES}
                    </div>
                    <span className={cn(
                      'font-medium truncate flex-1',
                      isAtLimit ? 'text-sun-900' : 'text-slate-700'
                    )}>
                      {getQuotaMessage(canonicalKey, validation?.current || 0, config.max)}
                    </span>
                    {isAtLimit && (
                      <Check className="h-3 w-3 text-sun-600 flex-shrink-0" aria-hidden="true" />
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipMessage}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
