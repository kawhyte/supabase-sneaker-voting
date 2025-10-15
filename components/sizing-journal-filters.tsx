// Path: components/sizing-journal-filters.tsx
'use client'

import { useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import { CATEGORY_CONFIGS, type ItemCategory } from '@/components/types/item-category'
import { FacetedFilter } from '@/components/ui/faceted-filter'

interface SizingJournalFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedBrands?: Set<string>
  onBrandChange: (brands: Set<string>) => void
  sortBy: string
  onSortChange: (value: string) => void
  availableBrands: string[]
  selectedCategories: ItemCategory[]
  onCategoriesChange: (categories: ItemCategory[]) => void
}

export function SizingJournalFilters({
  searchTerm,
  onSearchChange,
  selectedBrands = new Set(),
  onBrandChange,
  sortBy,
  onSortChange,
  availableBrands,
  selectedCategories,
  onCategoriesChange
}: SizingJournalFiltersProps) {

  const brandOptions = useMemo(() => availableBrands.map(brand => ({
    value: brand,
    label: brand
  })), [availableBrands])

  const allCategoryIds = useMemo(() => Object.keys(CATEGORY_CONFIGS) as ItemCategory[], [])

  const toggleCategory = (categoryId: ItemCategory) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryId))
    } else {
      onCategoriesChange([...selectedCategories, categoryId])
    }
  }

  const toggleAllCategories = () => {
    if (selectedCategories.length === allCategoryIds.length) {
      onCategoriesChange([])
    } else {
      onCategoriesChange(allCategoryIds)
    }
  }

  return (
    <div className="flex flex-col gap-lg mb-4xl border rounded-2xl p-3 bg-gray-100 ">
      {/* Category Filter Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-md shadow-sm">
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700 font-heading">Filter by Category</h3>
            <span className="text-xs text-gray-500">
              ({selectedCategories.length} of {allCategoryIds.length} selected)
            </span>
          </div>
          <button
            onClick={toggleAllCategories}
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            style={{
              backgroundColor: selectedCategories.length === allCategoryIds.length ? 'var(--color-primary-100)' : 'var(--color-gray-100)',
              color: selectedCategories.length === allCategoryIds.length ? 'var(--color-primary-900)' : 'var(--color-gray-700)',
            }}
          >
            {selectedCategories.length === allCategoryIds.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {Object.values(CATEGORY_CONFIGS).map((config) => {
            const IconComponent = config.icon
            const isSelected = selectedCategories.includes(config.id)

            return (
              <div key={config.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${config.id}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleCategory(config.id)}
                  className="data-[state=checked]:bg-[var(--color-primary-500)] data-[state=checked]:border-[var(--color-primary-500)]"
                />
                <Label
                  htmlFor={`category-${config.id}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                >
                  {/* <IconComponent className="h-3 w-3" style={{ color: config.color }} /> */}
                  {config.label}
                </Label>
              </div>
            )
          })}
        </div>
      </div>

      {/* Other Filters */}
      <div className="flex flex-col md:flex-row items-center gap-md">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-text-placeholder" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-5"
          />
        </div>

        <FacetedFilter
          title="Brand"
          options={brandOptions}
          selectedValues={selectedBrands}
          onValueChange={onBrandChange}
        />

        <div className="ml-0 md:ml-auto w-full md:w-auto">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-5 w-full md:w-[180px]">
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