/**
 * FINANCIAL STATS UTILITIES
 *
 * Calculate spending patterns, savings, and financial insights
 */

import { createClient } from '@/utils/supabase/client'

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
    .eq('status', 'owned')
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
      .eq('status', 'owned')
      .not('purchase_date', 'is', null)
      .order('purchase_date', { ascending: true })

    if (error) throw error

    return aggregateByMonth(data || [])
  }

  const { data, error } = await supabase
    .from('items')
    .select('purchase_date, purchase_price, retail_price')
    .eq('user_id', userId)
    .eq('status', 'owned')
    .gte('purchase_date', timeRange.start.toISOString())
    .lte('purchase_date', timeRange.end.toISOString())
    .order('purchase_date', { ascending: true })

  if (error) throw error

  return aggregateByMonth(data || [])
}

/**
 * Get wardrobe size over time (monthly snapshots)
 */
export async function getWardrobeSizeOverTime(
  userId: string
): Promise<Array<{ date: string; count: number }>> {
  const supabase = createClient()

  // Get all items with created_at dates
  const { data, error } = await supabase
    .from('items')
    .select('created_at, is_archived')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Build monthly snapshots
  const monthMap = new Map<string, number>()
  let runningCount = 0

  data?.forEach((item) => {
    const date = new Date(item.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    runningCount++
    monthMap.set(monthKey, runningCount)
  })

  return Array.from(monthMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
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
    .eq('status', 'owned')

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
