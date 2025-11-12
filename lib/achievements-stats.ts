/**
 * ACHIEVEMENTS STATS UTILITIES
 *
 * Purpose: Calculate and aggregate stats for achievements page
 * Uses: Existing database queries and calculations
 */

import { createClient } from '@/utils/supabase/client'

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
  category: string
  costPerWear: number
  targetCostPerWear: number
  image_url: string | null
  percentOfTarget: number
  wears: number
  purchase_price?: number
  retail_price?: number
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
function getTargetCostPerWear(price: number, _category: string): number {
  if (price < 50) return 2 // Budget items: $2/wear
  if (price < 150) return 5 // Mid-range: $5/wear
  return 10 // Premium: $10/wear
}

/**
 * Get top worn items for user (most frequently worn)
 * @param userId - User ID
 * @param limit - Number of items to return (default: 3)
 * @returns Array of top worn items, sorted by wear count descending
 * @throws Returns empty array on error (graceful degradation)
 */
export async function getTopWornItems(userId: string, limit: number = 3): Promise<TopWornItem[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        id,
        brand,
        model,
        color,
        category,
        wears,
        last_worn_date,
        purchase_price,
        retail_price,
        item_photos (
          image_url,
          is_main_image
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'owned')
      .eq('is_archived', false)
      .gte('wears', 1)  // Only items worn at least once
      .order('wears', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top worn items:', error)
      throw error
    }

    // Handle null/empty data gracefully
    if (!data || data.length === 0) {
      return []
    }

    // Map with fallback chains for missing fields
    return data.map((item) => ({
      id: item.id,
      brand: item.brand || 'Unknown Brand',
      model: item.model || item.brand || 'Unnamed Item',  // Fallback chain
      color: item.color || '',
      category: item.category || 'other',
      wears: item.wears || 0,
      lastWorn: item.last_worn_date || null,
      image_url: getMainImage(item),
      purchase_price: item.purchase_price || undefined,
      retail_price: item.retail_price || undefined,
    }))
  } catch (error) {
    console.error('Error in getTopWornItems:', error)
    return []  // Graceful degradation: return empty array instead of throwing
  }
}

/**
 * Get least worn items for user (items needing love)
 * Excludes brand new items (added in last 7 days with 0 wears)
 * @param userId - User ID
 * @param limit - Number of items to return (default: 3)
 * @returns Array of least worn items, sorted by wear count ascending
 * @throws Returns empty array on error (graceful degradation)
 */
export async function getLeastWornItems(userId: string, limit: number = 3): Promise<LeastWornItem[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        id,
        brand,
        model,
        color,
        category,
        wears,
        last_worn_date,
        created_at,
        item_photos (
          image_url,
          is_main_image
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'owned')
      .eq('is_archived', false)
      .order('wears', { ascending: true })
      .order('last_worn_date', { ascending: true, nullsFirst: true })  // Never worn items first
      .limit(limit * 3)  // Fetch more to account for filtering

    if (error) {
      console.error('Error fetching least worn items:', error)
      throw error
    }

    // Handle null/empty data gracefully
    if (!data || data.length === 0) {
      return []
    }

    // Filter out brand new items (added in last 7 days with 0 wears)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const filtered = data.filter((item) => {
      if (item.wears === 0) {
        const createdAt = new Date(item.created_at).getTime()
        return createdAt < sevenDaysAgo  // Only include if older than 7 days
      }
      return true
    })

    // Map with fallback chains and calculate days since last worn
    return filtered.slice(0, limit).map((item) => {
      let daysSinceLastWorn: number | null = null

      if (item.last_worn_date) {
        const lastWornDate = new Date(item.last_worn_date)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - lastWornDate.getTime())
        daysSinceLastWorn = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      } else if (item.created_at) {
        // Never worn - calculate days since added
        const createdDate = new Date(item.created_at)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - createdDate.getTime())
        daysSinceLastWorn = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }

      return {
        id: item.id,
        brand: item.brand || 'Unknown Brand',
        model: item.model || item.brand || 'Unnamed Item',  // Fallback chain
        color: item.color || '',
        category: item.category || 'other',
        wears: item.wears || 0,
        lastWorn: item.last_worn_date || null,
        daysSinceLastWorn,
        image_url: getMainImage(item),
      }
    })
  } catch (error) {
    console.error('Error in getLeastWornItems:', error)
    return []  // Graceful degradation: return empty array instead of throwing
  }
}

/**
 * Get best value items for user (lowest cost-per-wear that hit target)
 * @param userId - User ID
 * @param limit - Number of items to return (default: 5)
 * @returns Array of best value items, sorted by cost-per-wear ascending
 * @throws Returns empty array on error (graceful degradation)
 */
export async function getBestValueItems(userId: string, limit: number = 5): Promise<BestValueItem[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        id,
        brand,
        model,
        color,
        category,
        wears,
        purchase_price,
        retail_price,
        item_photos (
          image_url,
          is_main_image
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'owned')
      .eq('is_archived', false)
      .gte('wears', 1)  // Only items worn at least once

    if (error) {
      console.error('Error fetching best value items:', error)
      throw error
    }

    // Handle null/empty data gracefully
    if (!data || data.length === 0) {
      return []
    }

    // Calculate cost-per-wear for each item and filter those that hit target
    const itemsWithCPW = data
      .map((item): BestValueItem | null => {
        const price = item.purchase_price || item.retail_price
        if (!price || !item.wears) return null

        const cpw = price / item.wears
        const target = getTargetCostPerWear(price, item.category)
        const percentOfTarget = (cpw / target) * 100

        // Only include items that hit or beat their target
        if (cpw > target) return null

        return {
          id: item.id,
          brand: item.brand || 'Unknown Brand',
          model: item.model || item.brand || 'Unnamed Item',
          color: item.color || '',
          category: item.category || 'other',
          costPerWear: cpw,
          targetCostPerWear: target,
          percentOfTarget,
          wears: item.wears,
          image_url: getMainImage(item),
          purchase_price: item.purchase_price,
          retail_price: item.retail_price,
        }
      })
      .filter((item): item is BestValueItem => item !== null)
      .sort((a, b) => a.costPerWear - b.costPerWear)  // Sort by CPW ascending (best value first)
      .slice(0, limit)

    return itemsWithCPW
  } catch (error) {
    console.error('Error in getBestValueItems:', error)
    return []  // Graceful degradation: return empty array instead of throwing
  }
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
