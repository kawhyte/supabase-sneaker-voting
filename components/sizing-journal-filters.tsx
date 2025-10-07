'use client'

import { Card, CardContent } from '@/components/ui/card'
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
    <Card className="mb-[var(--space-xl)]">
      <CardContent className="p-[var(--space-base)]">
        {/* Category Filter */}
        <div className="mb-4 pb-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Filter by Category</h3>
            <button
              onClick={toggleAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedCategories.length === Object.keys(CATEGORY_CONFIGS).length ? 'Deselect All' : 'Select All'}
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
                  />
                  <Label
                    htmlFor={`category-${config.id}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                  >
                    <IconComponent className="h-3 w-3" style={{ color: config.color }} />
                    {config.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>

        {/* Existing Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--space-base)]">
          <div className="relative">
            <Search className="absolute left-3 top-3 transform -translate-y-1/2 h-2 w-2 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-6 h-6"
            />
          </div>

          <Select value={selectedUser} onValueChange={onUserChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="Kenny">Kenny</SelectItem>
              <SelectItem value="Rene">Rene</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedBrand} onValueChange={onBrandChange}>
            <SelectTrigger>
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
            <SelectTrigger>
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
      </CardContent>
    </Card>
  )
}
