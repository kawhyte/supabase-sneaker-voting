'use client'

import { cn } from '@/lib/utils'

export type CategoryFilter = 'all' | 'tops' | 'bottoms' | 'shoes' | 'accessories'

interface CategoryTabsProps {
  activeCategory: CategoryFilter
  onCategoryChange: (category: CategoryFilter) => void
  itemCounts?: Record<CategoryFilter, number>
}

const CATEGORIES: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
]

/**
 * CategoryTabs - Horizontal category filter tabs
 * Features:
 * - 5 categories: All, Tops, Bottoms, Shoes, Accessories
 * - Active state with border-b-primary
 * - Item counts per category (optional)
 * - Horizontal scrolling on mobile
 * - Keyboard accessible
 */
export function CategoryTabs({ activeCategory, onCategoryChange, itemCounts }: CategoryTabsProps) {
  return (
    <div className="border-b border-[#dbe4e6] dark:border-[#2d3748]">
      <div className="flex gap-4 sm:gap-6 overflow-x-auto -mx-2 px-2 scrollbar-hide">
        {CATEGORIES.map(({ value, label }) => {
          const isActive = activeCategory === value
          const count = itemCounts?.[value]

          return (
            <button
              key={value}
              onClick={() => onCategoryChange(value)}
              className={cn(
                'flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap transition-colors',
                isActive
                  ? 'border-b-primary text-primary'
                  : 'border-b-transparent text-[#618389] dark:text-gray-400 hover:text-foreground'
              )}
              aria-label={`Filter by ${label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                )}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
