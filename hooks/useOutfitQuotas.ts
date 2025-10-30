/**
 * useOutfitQuotas Hook
 *
 * Memoized hook for outfit quota calculations
 * Prevents unnecessary recalculations on every render
 */

import { useMemo } from 'react'
import type {
  OutfitItem,
  OutfitQuotaStatus,
} from '@/components/types/outfit'
import type { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import {
  getOutfitQuotaStatus,
  canAddItem,
  getCategoryCount,
} from '@/lib/quota-validation'

interface UseOutfitQuotasResult {
  quotaStatus: OutfitQuotaStatus
  canAdd: (item: SizingJournalEntry) => { canAdd: boolean; reason?: string }
  getCategoryCount: (category: string) => number
  hasViolations: boolean
}

export function useOutfitQuotas(
  outfitItems: OutfitItem[]
): UseOutfitQuotasResult {
  // Memoize quota status (only recalculate when outfitItems change)
  const quotaStatus = useMemo(
    () => getOutfitQuotaStatus(outfitItems),
    [outfitItems]
  )

  // Memoize canAdd function
  const canAddMemoized = useMemo(
    () => (item: SizingJournalEntry) => canAddItem(outfitItems, item),
    [outfitItems]
  )

  // Memoize category count function
  const getCategoryCountMemoized = useMemo(
    () => (category: string) => getCategoryCount(outfitItems, category),
    [outfitItems]
  )

  const hasViolations = quotaStatus.violations.length > 0

  return {
    quotaStatus,
    canAdd: canAddMemoized,
    getCategoryCount: getCategoryCountMemoized,
    hasViolations,
  }
}
