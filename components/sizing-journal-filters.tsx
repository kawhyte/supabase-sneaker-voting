'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

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
  availableBrands
}: SizingJournalFiltersProps) {
  return (
    <Card className="mb-[var(--space-xl)]">
      <CardContent className="p-[var(--space-base)]">
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
