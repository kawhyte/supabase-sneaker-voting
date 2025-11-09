/**
 * FINANCIAL STATS UTILITIES
 *
 * Calculate spending patterns, savings, and financial insights
 */

import { createClient } from '@/utils/supabase/client'
import { ItemStatus } from '@/types/ItemStatus'
import type { TimeRange as TimeRangeFilter } from '@/types/TimeRange'

export interface CategorySpending {
  category: string
  amount: number
  itemCount: number
  color: string
}

export interface SpendingTrend {
  date: string
  amount: number
  category?: string
}

export interface TimeRange {
  start: Date
  end: Date
}

export type TimePeriod = 'month' | 'quarter' | 'year' | 'all'

/**
 * Get spending by category for a time period
 */
export async function getCategorySpending(
  userId: string,
  period: TimePeriod = 'all'
): Promise<CategorySpending[]> {
  const supabase = createClient()
  const timeRange = getTimeRange(period)

  let query = supabase
    .from('items')
    .select('category, purchase_price, retail_price')
    .eq('user_id', userId)
    .eq('status', ItemStatus.OWNED)
    .eq('is_archived', false)

  if (timeRange) {
    query = query
      .gte('purchase_date', timeRange.start.toISOString())
      .lte('purchase_date', timeRange.end.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching category spending:', error)
    throw error
  }

  // Aggregate by category
  const categoryMap = new Map<string, { amount: number; count: number }>()

  data?.forEach((item) => {
    const price = item.purchase_price || item.retail_price || 0
    if (price === 0) return

    const existing = categoryMap.get(item.category) || { amount: 0, count: 0 }
    categoryMap.set(item.category, {
      amount: existing.amount + price,
      count: existing.count + 1,
    })
  })

  // Convert to array with colors
  const categoryColors: Record<string, string> = {
    sneakers: '#3B82F6', // blue
    tops: '#10B981', // green
    bottoms: '#F59E0B', // amber
    outerwear: '#8B5CF6', // purple
    accessories: '#EC4899', // pink
    bags: '#14B8A6', // teal
    hats: '#F97316', // orange
    other: '#6B7280', // gray
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: data.amount,
    itemCount: data.count,
    color: categoryColors[category] || '#6B7280',
  }))
}

/**
 * Get spending trends over time (monthly aggregation)
 */
export async function getSpendingTrends(
  userId: string,
  period: TimePeriod = 'year'
): Promise<SpendingTrend[]> {
  const supabase = createClient()
  const timeRange = getTimeRange(period)

  if (!timeRange) {
    // For 'all', get monthly aggregates
    const { data, error } = await supabase
      .from('items')
      .select('purchase_date, purchase_price, retail_price')
      .eq('user_id', userId)
      .eq('status', ItemStatus.OWNED)
      .not('purchase_date', 'is', null)
      .order('purchase_date', { ascending: true })

    if (error) throw error

    return aggregateByMonth(data || [])
  }

  const { data, error } = await supabase
    .from('items')
    .select('purchase_date, purchase_price, retail_price')
    .eq('user_id', userId)
    .eq('status', ItemStatus.OWNED)
    .gte('purchase_date', timeRange.start.toISOString())
    .lte('purchase_date', timeRange.end.toISOString())
    .order('purchase_date', { ascending: true })

  if (error) throw error

  return aggregateByMonth(data || [])
}

/**
 * Get wardrobe size over time (monthly snapshots)
 * Returns cumulative count of items by month, filtered by time range
 *
 * @param userId - User ID
 * @param timeRange - Time period to include ('6mo' | '12mo' | 'all')
 * @returns Array of {month, count} objects with month format 'Jan 25'
 */
export async function getWardrobeSizeOverTime(
  userId: string,
  timeRange: TimeRangeFilter = '12mo'
): Promise<Array<{ month: string; count: number }>> {
  try {
    const supabase = createClient()

    // Determine start date based on time range
    let startDate: string | null = null

    switch (timeRange) {
      case '6mo': {
        // Calculate date 6 months ago
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        startDate = sixMonthsAgo.toISOString()
        break
      }
      case '12mo': {
        // Calculate date 12 months ago
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        startDate = twelveMonthsAgo.toISOString()
        break
      }
      case 'all': {
        // No date restriction
        startDate = null
        break
      }
      default: {
        // Fallback to 12 months for unknown values
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        startDate = twelveMonthsAgo.toISOString()
      }
    }

    // Build query with optional date filter
    let query = supabase
      .from('items')
      .select('created_at')
      .eq('user_id', userId)
      .not('is_archived', 'is', true)
      .order('created_at', { ascending: true })

    // Apply date filter if time range is not 'all'
    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    const { data, error } = await query

    // Handle query errors
    if (error) {
      console.error(
        `Error fetching wardrobe size for timeRange "${timeRange}":`,
        error
      )
      return []
    }

    // Handle empty result
    if (!data || data.length === 0) {
      return []
    }

    // Aggregate data by month
    const monthlyData: Record<string, number> = {}
    let runningTotal = 0

    data.forEach((item) => {
      const date = new Date(item.created_at)
      const monthKey = date.toLocaleString('en-US', {
        year: '2-digit',
        month: 'short',
      })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }

      runningTotal++
      monthlyData[monthKey] = runningTotal
    })

    // Convert to array format expected by chart component
    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }))
  } catch (error) {
    console.error(
      'Unexpected error in getWardrobeSizeOverTime:',
      error instanceof Error ? error.message : String(error)
    )
    return []
  }
}

/**
 * Calculate total saved from price monitoring
 */
export async function getTotalSaved(userId: string): Promise<number> {
  const supabase = createClient()

  // Get all items where sale_price < retail_price
  const { data, error } = await supabase
    .from('items')
    .select('retail_price, sale_price, purchase_price')
    .eq('user_id', userId)
    .eq('status', ItemStatus.OWNED)

  if (error) throw error

  return (data || []).reduce((total, item) => {
    const retail = item.retail_price || 0
    const paid = item.purchase_price || item.sale_price || retail
    const saved = retail - paid
    return total + (saved > 0 ? saved : 0)
  }, 0)
}

/**
 * Get time range for a period
 */
function getTimeRange(period: TimePeriod): TimeRange | null {
  const now = new Date()
  const start = new Date()

  switch (period) {
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(now.getMonth() - 3)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
    case 'all':
      return null
  }

  return { start, end: now }
}

/**
 * Aggregate spending by month
 */
function aggregateByMonth(items: any[]): SpendingTrend[] {
  const monthMap = new Map<string, number>()

  items.forEach((item) => {
    if (!item.purchase_date) return

    const date = new Date(item.purchase_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const price = item.purchase_price || item.retail_price || 0

    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + price)
  })

  return Array.from(monthMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
