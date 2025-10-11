import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import { type ItemCategory } from '@/components/types/item-category'

export function filterJournalEntries(
  entries: SizingJournalEntry[],
  searchTerm: string,
  selectedUsers: Set<string>,
  selectedBrands: Set<string>,
  selectedCategories: ItemCategory[] = []
): SizingJournalEntry[] {
  return entries.filter(entry => {
    const matchesSearch = searchTerm === '' ||
      entry.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.color.toLowerCase().includes(searchTerm.toLowerCase())

    // Note: User filtering is now handled at the database level via RLS and queries
    // The selectedUsers parameter is kept for backward compatibility but no longer used
    const matchesBrand = selectedBrands.size === 0 || selectedBrands.has(entry.brand)
    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.includes(entry.category as ItemCategory)

    return matchesSearch && matchesBrand && matchesCategory
  })
}

export function sortJournalEntries(
  entries: SizingJournalEntry[],
  sortBy: string
): SizingJournalEntry[] {
  return [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'fit-rating':
        return (a.fit_rating || 0) - (b.fit_rating || 0)
      case 'brand':
        return a.brand.localeCompare(b.brand)
      default:
        return 0
    }
  })
}

export function getUniqueBrands(entries: SizingJournalEntry[]): string[] {
  return Array.from(new Set(entries.map(entry => entry.brand))).sort()
}
