import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'

export function filterJournalEntries(
  entries: SizingJournalEntry[],
  searchTerm: string,
  selectedUser: string,
  selectedBrand: string
): SizingJournalEntry[] {
  return entries.filter(entry => {
    const matchesSearch = searchTerm === '' ||
      entry.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.colorway.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesUser = selectedUser === 'all' || entry.user_name === selectedUser
    const matchesBrand = selectedBrand === 'all' || entry.brand === selectedBrand

    return matchesSearch && matchesUser && matchesBrand
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
