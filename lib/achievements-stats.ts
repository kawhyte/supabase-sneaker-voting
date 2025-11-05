/**
 * ACHIEVEMENTS STATS UTILITIES
 *
 * Purpose: Calculate and aggregate stats for achievements page
 * Uses: Existing database queries and calculations
 */

import { createClient } from '@/utils/supabase/client'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'

export interface WardrobeStats {
  totalItems: number
  totalWears: number
  daysTracked: number
  mostWornItem: MostWornItem | null
  bestValue: BestValueItem | null
  currentStreak: number
  totalSaved: number
}

export interface MostWornItem {
  id: string
  brand: string
  model: string
  color: string
  wears: number
  image_url: string | null
  category: string
}

export interface BestValueItem {
  id: string
  brand: string
  model: string
  color: string
  costPerWear: number
  targetCostPerWear: number
  image_url: string | null
  percentOfTarget: number
}

export interface TopWornItem {
  id: string
  brand: string
  model: string
  color: string
  category: string
  wears: number
  lastWorn: string | null
  image_url: string | null
  purchase_price?: number
  retail_price?: number
}

export interface LeastWornItem {
  id: string
  brand: string
  model: string
  color: string
  category: string
  wears: number
  lastWorn: string | null
  daysSinceLastWorn: number | null
  image_url: string | null
}

/**
 * Fetch core wardrobe statistics
 */
export async function getWardrobeStats(userId: string): Promise<WardrobeStats> {
  const supabase = createClient()

  try {
    // Get all owned items (not archived)
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'owned')
      .eq('is_archived', false)

    if (error) {
      console.error('Error fetching items:', error)
      throw error
    }

    if (!items || items.length === 0) {
      return {
        totalItems: 0,
        totalWears: 0,
        daysTracked: 0,
        mostWornItem: null,
        bestValue: null,
        currentStreak: 0,
        totalSaved: 0,
      }
    }

    // Calculate total wears
    const totalWears = items.reduce((sum, item) => sum + (item.wears || 0), 0)

    // Calculate days tracked (from oldest item)
    const oldestItemDate = items.reduce((oldest, item) => {
      const itemDate = new Date(item.created_at)
      return itemDate < oldest ? itemDate : oldest
    }, new Date())
    const daysTracked = Math.floor(
      (Date.now() - oldestItemDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Find most worn item
    const mostWornItem = items.reduce((max, item) => {
      const itemWears = item.wears || 0
      const maxWears = max?.wears || 0
      return itemWears > maxWears ? item : max
    }, items[0])

    // Find best value item (lowest cost-per-wear that hit target)
    const bestValueItem = items
      .filter((item) => {
        const wears = item.wears || 0
        if (wears === 0) return false
        const price = item.purchase_price || item.retail_price
        if (!price) return false
        const cpw = price / wears
        const target = getTargetCostPerWear(price, item.category)
        return cpw <= target
      })
      .reduce((best, item) => {
        const price = item.purchase_price || item.retail_price || 0
        const wears = item.wears || 1
        const cpw = price / wears
        const target = getTargetCostPerWear(price, item.category)
        const percentOfTarget = (cpw / target) * 100

        if (!best) return { ...item, costPerWear: cpw, targetCostPerWear: target, percentOfTarget }

        const bestCpw = best.costPerWear
        return cpw < bestCpw
          ? { ...item, costPerWear: cpw, targetCostPerWear: target, percentOfTarget }
          : best
      }, null as any)

    // Get total saved from price alerts (placeholder - implement later)
    const totalSaved = 0 // Phase 2

    // Get current wear logging streak (placeholder - implement later)
    const currentStreak = 0 // Phase 2

    return {
      totalItems: items.length,
      totalWears,
      daysTracked,
      mostWornItem: mostWornItem
        ? {
            id: mostWornItem.id,
            brand: mostWornItem.brand,
            model: mostWornItem.model,
            color: mostWornItem.color,
            wears: mostWornItem.wears || 0,
            image_url: mostWornItem.image_url,
            category: mostWornItem.category,
          }
        : null,
      bestValue: bestValueItem,
      currentStreak,
      totalSaved,
    }
  } catch (error) {
    console.error('Error calculating wardrobe stats:', error)
    throw error
  }
}

/**
 * Get target cost-per-wear based on price
 * (Copied from wardrobe-item-utils.ts)
 */
function getTargetCostPerWear(price: number, category: string): number {
  if (price < 50) return 2 // Budget items: $2/wear
  if (price < 150) return 5 // Mid-range: $5/wear
  return 10 // Premium: $10/wear
}

/**
 * Get top 5 most worn items
 */
export async function getTopWornItems(userId: string): Promise<TopWornItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('items')
    .select('id, brand, model, color, category, wears, last_worn_date, image_url, purchase_price, retail_price, item_photos(image_url, is_main_image)')
    .eq('user_id', userId)
    .eq('status', 'owned')
    .eq('is_archived', false)
    .order('wears', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching top worn items:', error)
    throw error
  }

  return (data || []).map((item) => ({
    id: item.id,
    brand: item.brand,
    model: item.model,
    color: item.color,
    category: item.category,
    wears: item.wears || 0,
    lastWorn: item.last_worn_date,
    image_url: getMainImage(item),
    purchase_price: item.purchase_price,
    retail_price: item.retail_price,
  }))
}

/**
 * Get top 5 least worn items (excluding 0-wear items added in last 7 days)
 */
export async function getLeastWornItems(userId: string): Promise<LeastWornItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('items')
    .select('id, brand, model, color, category, wears, last_worn_date, created_at, image_url, item_photos(image_url, is_main_image)')
    .eq('user_id', userId)
    .eq('status', 'owned')
    .eq('is_archived', false)
    .order('wears', { ascending: true })
    .limit(20) // Get 20 and filter

  if (error) {
    console.error('Error fetching least worn items:', error)
    throw error
  }

  // Filter out brand new items (added in last 7 days with 0 wears)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const filtered = (data || []).filter((item) => {
    if (item.wears === 0) {
      const createdAt = new Date(item.created_at).getTime()
      return createdAt < sevenDaysAgo // Only include if older than 7 days
    }
    return true
  })

  return filtered.slice(0, 5).map((item) => {
    const daysSinceLastWorn = item.last_worn_date
      ? Math.floor((Date.now() - new Date(item.last_worn_date).getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      id: item.id,
      brand: item.brand,
      model: item.model,
      color: item.color,
      category: item.category,
      wears: item.wears || 0,
      lastWorn: item.last_worn_date,
      daysSinceLastWorn,
      image_url: getMainImage(item),
    }
  })
}

/**
 * Helper to get main image from item or item_photos
 */
function getMainImage(item: any): string | null {
  // Try item_photos first
  if (item.item_photos && Array.isArray(item.item_photos)) {
    const mainPhoto = item.item_photos.find((p: any) => p.is_main_image)
    if (mainPhoto?.image_url) return mainPhoto.image_url
    if (item.item_photos[0]?.image_url) return item.item_photos[0].image_url
  }

  // Fallback to legacy image_url
  return item.image_url || null
}
