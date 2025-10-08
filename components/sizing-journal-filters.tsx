// Path: sizing-journal-filters.tsx
'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { CATEGORY_CONFIGS, type ItemCategory } from '@/components/types/item-category'
import { FacetedFilter } from '@/components/ui/faceted-filter' // Import the new component

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

  // Prepare the categories for our new component
  const categoryOptions = Object.values(CATEGORY_CONFIGS).map(config => ({
    value: config.id,
    label: config.label,
    icon: config.icon
  }))

  return (
    <div className="flex flex-col md:flex-row items-center gap-[var(--space-md)] mb-[var(--space-xl)]">
      {/* Search input remains the primary element */}
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-placeholder" />
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* --- OLD CATEGORY FILTER REMOVED --- */}
      {/* The entire div with checkboxes is now gone. */}

      {/* Integrate the new FacetedFilter for categories */}
      <FacetedFilter
        title="Category"
        options={categoryOptions}
        selectedValues={new Set(selectedCategories)}
        onValueChange={(newSelected) => {
          onCategoriesChange(Array.from(newSelected))
        }}
      />

      {/* The other filters will be updated in the next phase */}
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
      </div>

       {/* We'll move the sort dropdown to the end for better layout flow */}
      <div className="ml-auto flex items-center gap-[var(--space-md)]">
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
  )
}