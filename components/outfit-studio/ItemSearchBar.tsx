'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ItemSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * ItemSearchBar - Search input for filtering wardrobe items
 * Features:
 * - Real-time search (no debounce for instant results)
 * - Search icon on left
 * - Clear button when text present
 */
export function ItemSearchBar({ value, onChange, placeholder = 'Search wardrobe...' }: ItemSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-4 h-12 bg-[#f0f4f4] dark:bg-background border-none focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="Search wardrobe items"
      />
    </div>
  )
}
