// Path: sizing-journal-filters.tsx
'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import { CATEGORY_CONFIGS, type ItemCategory } from '@/components/types/item-category'

interface SizingJournalFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedUser: string
  onUserChange: (value: string) => void
  selectedBrand: string
  onBrandChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  availableBrands: string[]
  selectedCategories: ItemCategory[]
  onCategoriesChange: (categories: ItemCategory[]) => void
}

export function SizingJournalFilters({
  searchTerm,
  onSearchChange,
  selectedUser,
  onUserChange,
  selectedBrand,
  onBrandChange,
  sortBy,
  onSortChange,
  availableBrands,
  selectedCategories,
  onCategoriesChange
}: SizingJournalFiltersProps) {
  const toggleCategory = (category: ItemCategory) => {
    onCategoriesChange(
      selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category]
    )
  }

  const toggleAll = () => {
    const allCategories = Object.keys(CATEGORY_CONFIGS) as ItemCategory[]
    onCategoriesChange(
      selectedCategories.length === allCategories.length ? [] : allCategories
    )
  }

  return (
    // We will replace the Card component with a series of divs for a toolbar layout.
    // The main container will be a simple div for now.
    <div className="mb-[var(--space-xl)]">

      {/* Category Filter - We'll keep this above the main toolbar for now. It will be integrated in Phase 2. */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-secondary">Filter by Category</h3>
          <button
            onClick={toggleAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {selectedCategories.length === Object.keys(CATEGORY_CONFIGS).length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          {Object.values(CATEGORY_CONFIGS).map((config) => {
            const IconComponent = config.icon
            const isSelected = selectedCategories.includes(config.id)
            return (
              <div key={config.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${config.id}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleCategory(config.id)}
                />
                <Label
                  htmlFor={`category-${config.id}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5 text-text-primary"
                >
                  <IconComponent className="h-4 w-4" style={{ color: config.color }} />
                  {config.label}
                </Label>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-[var(--space-md)]">
        {/* Search input is the primary element, taking up available space */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-placeholder" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10" // Increased padding for icon and larger height for better feel
          />
        </div>

        {/* Other filters are grouped to the right */}
        <div className="flex w-full md:w-auto items-center gap-[var(--space-md)]">
            <Select value={selectedUser} onValueChange={onUserChange}>
                <SelectTrigger className="h-10 w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="Kenny">Kenny</SelectItem>
                    <SelectItem value="Rene">Rene</SelectItem>
                </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={onBrandChange}>
                <SelectTrigger className="h-10 w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {availableBrands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="h-10 w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="fit-rating">By Fit Rating</SelectItem>
                    <SelectItem value="brand">By Brand</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
    </div>
  )
}