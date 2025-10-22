import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import { type ItemCategory } from '@/components/types/item-category'

/**
 * Safely checks if a string value matches the search term.
 * Handles null/undefined values by treating them as empty strings.
 * This ensures the filter doesn't crash when searching for entries with missing fields.
 *
 * @param value - The string value to search in (can be null/undefined)
 * @param searchTerm - The search term to match
 * @returns true if the value matches the search term, false otherwise
 *
 * @example
 * safeStringMatch('Jordan', 'jordan') // true
 * safeStringMatch(null, 'test') // true (null treated as empty string)
 * safeStringMatch('Nike Air', 'Air') // true
 */
function safeStringMatch(value: string | null | undefined, searchTerm: string): boolean {
  return (value ?? '').toLowerCase().includes(searchTerm.toLowerCase())
}

export function filterJournalEntries(
  entries: SizingJournalEntry[],
  searchTerm: string,
  selectedUsers: Set<string>,
  selectedBrands: Set<string>,
  selectedCategories: ItemCategory[] = []
): SizingJournalEntry[] {
  return entries.filter(entry => {
    const matchesSearch = searchTerm === '' ||
      safeStringMatch(entry.brand, searchTerm) ||
      safeStringMatch(entry.model, searchTerm) ||
      safeStringMatch(entry.color, searchTerm)

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
      case 'comfort-rating':
        return (a.comfort_rating || 0) - (b.comfort_rating || 0)
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
