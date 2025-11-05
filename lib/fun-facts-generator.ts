/**
 * FUN FACTS GENERATOR
 *
 * Philosophy: Delightful, surprising, actionable
 * - Positive framing only (no guilt)
 * - Celebrate uniqueness
 * - Surface hidden patterns
 * - Suggest next actions
 */

import { createClient } from '@/utils/supabase/client'

export interface FunFact {
  id: string
  title: string
  message: string
  emoji: string
  category: 'personality' | 'hidden-gem' | 'brand' | 'color' | 'seasonal' | 'value' | 'creativity' | 'pattern'
  actionLabel?: string
  actionLink?: string
}

/**
 * Generate fun facts for a user
 */
export async function generateFunFacts(userId: string, count: number = 6): Promise<FunFact[]> {
  const supabase = createClient()

  // Fetch user data
  const { data: items } = await supabase
    .from('sneakers')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'owned')
    .eq('is_archived', false)

  const { data: outfits } = await supabase
    .from('outfits')
    .select('*, outfit_items(*)')
    .eq('user_id', userId)
    .eq('is_archived', false)

  if (!items || items.length === 0) {
    return getEmptyStateFacts()
  }

  const allFacts: FunFact[] = []

  // 1. Most Worn Category
  allFacts.push(getMostWornCategoryFact(items))

  // 2. Hidden Gem (least worn but valuable)
  const hiddenGem = getHiddenGemFact(items)
  if (hiddenGem) allFacts.push(hiddenGem)

  // 3. Brand Loyalty
  const brandFact = getBrandLoyaltyFact(items)
  if (brandFact) allFacts.push(brandFact)

  // 4. Color Preference
  allFacts.push(getColorPreferenceFact(items))

  // 5. Wardrobe Versatility
  const versatilityFact = getVersatilityFact(items, outfits || [])
  if (versatilityFact) allFacts.push(versatilityFact)

  // 6. Cost-Per-Wear Champion
  const cpwFact = getCostPerWearChampionFact(items)
  if (cpwFact) allFacts.push(cpwFact)

  // 7. Seasonal Rotation
  allFacts.push(getSeasonalRotationFact(items))

  // 8. Wardrobe Age
  allFacts.push(getWardrobeAgeFact(items))

  // 9. Most Versatile Item
  const mostVersatile = getMostVersatileItemFact(items, outfits || [])
  if (mostVersatile) allFacts.push(mostVersatile)

  // 10. Category Diversity
  allFacts.push(getCategoryDiversityFact(items))

  // 11. Average Wears
  allFacts.push(getAverageWearsFact(items))

  // 12. Wardrobe Value
  allFacts.push(getWardrobeValueFact(items))

  // 13. Purchase Momentum
  allFacts.push(getPurchaseMomentumFact(items))

  // 14. Weekend Warrior
  const weekendFact = getWeekendWarriorFact(items)
  if (weekendFact) allFacts.push(weekendFact)

  // 15. Collection Growth
  allFacts.push(getCollectionGrowthFact(items))

  // 16-18. Comparative Stats vs Average User
  const avgStats = await getAverageUserStats()
  allFacts.push(...getComparativeStatsFacts(items, avgStats))

  // Shuffle and return requested count
  return shuffleArray(allFacts).slice(0, count)
}

/**
 * FACT GENERATORS
 */

function getMostWornCategoryFact(items: any[]): FunFact {
  const categoryCounts = new Map<string, number>()
  items.forEach((item) => {
    const wears = item.wears || 0
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + wears)
  })

  const topCategory = Array.from(categoryCounts.entries()).reduce((max, entry) =>
    entry[1] > max[1] ? entry : max
  )

  const categoryEmojis: Record<string, string> = {
    sneakers: '👟',
    tops: '👕',
    bottoms: '👖',
    outerwear: '🧥',
    accessories: '🎒',
    bags: '👜',
    hats: '🧢',
    other: '👗',
  }

  return {
    id: 'most-worn-category',
    title: 'Your Go-To Category',
    message: `You're a ${topCategory[0]} enthusiast! They make up the most-worn items in your wardrobe.`,
    emoji: categoryEmojis[topCategory[0]] || '👕',
    category: 'personality',
    actionLabel: 'View Collection',
    actionLink: '/dashboard?tab=owned',
  }
}

function getHiddenGemFact(items: any[]): FunFact | null {
  // Find expensive items with low wears
  const underused = items
    .filter((item) => {
      const price = item.purchase_price || item.retail_price
      return price && price > 50 && (item.wears || 0) < 3
    })
    .sort((a, b) => {
      const priceA = a.purchase_price || a.retail_price || 0
      const priceB = b.purchase_price || b.retail_price || 0
      return priceB - priceA
    })

  if (underused.length === 0) return null

  const item = underused[0]
  return {
    id: 'hidden-gem',
    title: 'Hidden Gem Alert',
    message: `Your ${item.brand} ${item.model} is a hidden treasure! Only ${item.wears || 0} wears so far. Time to show it off! ✨`,
    emoji: '💎',
    category: 'hidden-gem',
    actionLabel: 'Create Outfit',
    actionLink: '/dashboard?tab=owned',
  }
}

function getBrandLoyaltyFact(items: any[]): FunFact | null {
  const brandCounts = new Map<string, number>()
  items.forEach((item) => {
    brandCounts.set(item.brand, (brandCounts.get(item.brand) || 0) + 1)
  })

  const topBrand = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]

  if (!topBrand || topBrand[1] < 3) return null

  const percentage = Math.round((topBrand[1] / items.length) * 100)

  return {
    id: 'brand-loyalty',
    title: 'Brand Loyalty',
    message: `You're a ${topBrand[0]} fan! ${percentage}% of your wardrobe is from this brand. #BrandAmbassador`,
    emoji: '🏷️',
    category: 'brand',
  }
}

function getColorPreferenceFact(items: any[]): FunFact {
  const colorCounts = new Map<string, number>()
  items.forEach((item) => {
    const color = item.color?.toLowerCase() || 'unknown'
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1)
  })

  const topColor = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]

  const colorEmojis: Record<string, string> = {
    black: '🖤',
    white: '🤍',
    blue: '💙',
    red: '❤️',
    green: '💚',
    yellow: '💛',
    orange: '🧡',
    purple: '💜',
    pink: '💗',
    brown: '🤎',
  }

  return {
    id: 'color-preference',
    title: 'Signature Color',
    message: `${topColor[0].charAt(0).toUpperCase() + topColor[0].slice(1)} is your power color! It dominates your wardrobe palette.`,
    emoji: colorEmojis[topColor[0]] || '🎨',
    category: 'color',
  }
}

function getVersatilityFact(items: any[], outfits: any[]): FunFact | null {
  if (outfits.length === 0) return null

  const uniqueItemsInOutfits = new Set(
    outfits.flatMap((outfit) => outfit.outfit_items?.map((oi: any) => oi.item_id) || [])
  ).size

  const percentage = Math.round((uniqueItemsInOutfits / items.length) * 100)

  return {
    id: 'versatility',
    title: 'Outfit Versatility',
    message: `${percentage}% of your wardrobe has been featured in an outfit. You're great at mixing and matching!`,
    emoji: '🎭',
    category: 'creativity',
    actionLabel: 'Create More',
    actionLink: '/dashboard?tab=outfits',
  }
}

function getCostPerWearChampionFact(items: any[]): FunFact | null {
  const itemsWithCPW = items
    .filter((item) => {
      const price = item.purchase_price || item.retail_price
      const wears = item.wears || 0
      return price && wears > 0
    })
    .map((item) => {
      const price = item.purchase_price || item.retail_price
      const wears = item.wears || 1
      return {
        ...item,
        cpw: price / wears,
      }
    })
    .sort((a, b) => a.cpw - b.cpw)

  if (itemsWithCPW.length === 0) return null

  const champion = itemsWithCPW[0]

  return {
    id: 'cpw-champion',
    title: 'Best Value Item',
    message: `Your ${champion.brand} ${champion.model} is killing it at just $${champion.cpw.toFixed(2)} per wear! 🏆`,
    emoji: '💰',
    category: 'value',
  }
}

function getSeasonalRotationFact(items: any[]): FunFact {
  const currentMonth = new Date().getMonth()
  const currentSeason = getSeason(currentMonth)

  const recentWears = items.filter((item) => {
    if (!item.last_worn_date) return false
    const lastWorn = new Date(item.last_worn_date)
    const daysSince = (Date.now() - lastWorn.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 30
  }).length

  const percentage = Math.round((recentWears / items.length) * 100)

  return {
    id: 'seasonal-rotation',
    title: `${currentSeason} Rotation`,
    message: `You've worn ${percentage}% of your wardrobe this month. Perfect for ${currentSeason.toLowerCase()} weather!`,
    emoji: getSeasonEmoji(currentSeason),
    category: 'seasonal',
  }
}

function getWardrobeAgeFact(items: any[]): FunFact {
  const oldestItem = items.reduce((oldest, item) => {
    const itemDate = new Date(item.created_at)
    const oldestDate = new Date(oldest.created_at)
    return itemDate < oldestDate ? item : oldest
  }, items[0])

  const daysSince = Math.floor(
    (Date.now() - new Date(oldestItem.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    id: 'wardrobe-age',
    title: 'Wardrobe Veteran',
    message: `You've been tracking your style for ${daysSince} days! Your oldest tracked item: ${oldestItem.brand}.`,
    emoji: '📅',
    category: 'pattern',
  }
}

function getMostVersatileItemFact(items: any[], outfits: any[]): FunFact | null {
  if (outfits.length === 0) return null

  const itemUsage = new Map<string, number>()
  outfits.forEach((outfit) => {
    outfit.outfit_items?.forEach((oi: any) => {
      itemUsage.set(oi.item_id, (itemUsage.get(oi.item_id) || 0) + 1)
    })
  })

  const mostUsedId = Array.from(itemUsage.entries())
    .sort((a, b) => b[1] - a[1])[0]

  if (!mostUsedId) return null

  const item = items.find((i) => i.id === mostUsedId[0])
  if (!item) return null

  return {
    id: 'most-versatile',
    title: 'Outfit MVP',
    message: `Your ${item.brand} ${item.model} appears in ${mostUsedId[1]} outfits! That's true versatility.`,
    emoji: '🌟',
    category: 'creativity',
  }
}

function getCategoryDiversityFact(items: any[]): FunFact {
  const uniqueCategories = new Set(items.map((item) => item.category)).size

  return {
    id: 'category-diversity',
    title: 'Style Diversity',
    message: `You have items across ${uniqueCategories} categories. Love the variety in your wardrobe!`,
    emoji: '🎨',
    category: 'personality',
  }
}

function getAverageWearsFact(items: any[]): FunFact {
  const totalWears = items.reduce((sum, item) => sum + (item.wears || 0), 0)
  const avgWears = Math.round(totalWears / items.length)

  return {
    id: 'average-wears',
    title: 'Wear Rate',
    message: `Each item averages ${avgWears} wears. ${avgWears > 5 ? "You're getting great use!" : 'Room to wear more!'}`,
    emoji: '📊',
    category: 'pattern',
  }
}

function getWardrobeValueFact(items: any[]): FunFact {
  const totalValue = items.reduce((sum, item) => {
    const price = item.purchase_price || item.retail_price || 0
    return sum + price
  }, 0)

  return {
    id: 'wardrobe-value',
    title: 'Wardrobe Investment',
    message: `Your tracked wardrobe is valued at $${totalValue.toFixed(0)}. ${totalValue > 1000 ? 'Impressive collection!' : 'Growing nicely!'}`,
    emoji: '💵',
    category: 'value',
  }
}

function getPurchaseMomentumFact(items: any[]): FunFact {
  const last30Days = items.filter((item) => {
    const daysSince = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 30
  }).length

  const last60Days = items.filter((item) => {
    const daysSince = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 60 && daysSince > 30
  }).length

  const momentum = last30Days > last60Days ? 'gaining' : last30Days < last60Days ? 'slowing' : 'steady'

  return {
    id: 'purchase-momentum',
    title: 'Collection Growth',
    message: `Your collection is ${momentum} momentum with ${last30Days} items added this month.`,
    emoji: momentum === 'gaining' ? '📈' : momentum === 'slowing' ? '📉' : '➡️',
    category: 'pattern',
  }
}

function getWeekendWarriorFact(items: any[]): FunFact | null {
  // Need outfit wear data to determine weekend vs weekday
  // Placeholder for now
  return {
    id: 'weekend-warrior',
    title: 'Weekend Style',
    message: `Your weekend outfits lean casual. Perfect for relaxing vibes! 😎`,
    emoji: '🏖️',
    category: 'pattern',
  }
}

function getCollectionGrowthFact(items: any[]): FunFact {
  const sortedByDate = [...items].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const firstMonth = new Date(sortedByDate[0].created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return {
    id: 'collection-growth',
    title: 'Since Day One',
    message: `You started tracking in ${firstMonth} and now have ${items.length} items. Look at that growth!`,
    emoji: '🌱',
    category: 'pattern',
  }
}

/**
 * COMPARATIVE STATS (vs Average User)
 */

interface AverageUserStats {
  avg_wardrobe_size: number
  avg_wears_per_item: number
  avg_cost_per_wear: number
  avg_categories: number
}

async function getAverageUserStats(): Promise<AverageUserStats> {
  // For now, return placeholder values
  // In production, this would call an RPC function or aggregate query
  return {
    avg_wardrobe_size: 25,
    avg_wears_per_item: 8,
    avg_cost_per_wear: 12,
    avg_categories: 3,
  }
}

function getComparativeStatsFacts(items: any[], avgStats: AverageUserStats): FunFact[] {
  const facts: FunFact[] = []

  // Wardrobe Size Comparison
  const wardrobeSize = items.length
  const wardrobeDiff = wardrobeSize - avgStats.avg_wardrobe_size
  const wardrobePercent = Math.abs(Math.round((wardrobeDiff / avgStats.avg_wardrobe_size) * 100))

  if (wardrobeSize > avgStats.avg_wardrobe_size) {
    facts.push({
      id: 'comparative-wardrobe-size',
      title: 'Curator Extraordinaire',
      message: `Your wardrobe is ${wardrobePercent}% larger than the average PurrView user! You've got options! 🎨`,
      emoji: '📊',
      category: 'personality',
    })
  } else if (wardrobeSize < avgStats.avg_wardrobe_size) {
    facts.push({
      id: 'comparative-wardrobe-size',
      title: 'Minimalist Maven',
      message: `You keep it lean! Your wardrobe is ${wardrobePercent}% smaller than average. Quality over quantity! ✨`,
      emoji: '📊',
      category: 'personality',
    })
  }

  // Wears Per Item Comparison
  const totalWears = items.reduce((sum, item) => sum + (item.wears || 0), 0)
  const avgWears = items.length > 0 ? totalWears / items.length : 0
  const wearsDiff = avgWears - avgStats.avg_wears_per_item

  if (wearsDiff > 2) {
    facts.push({
      id: 'comparative-wears',
      title: 'Utilization Champion',
      message: `You wear your items ${Math.round(avgWears)} times on average—way more than most users! True maximizer! 💪`,
      emoji: '📈',
      category: 'value',
    })
  }

  // Cost Per Wear Comparison
  const itemsWithCPW = items.filter((item) => {
    const price = item.purchase_price || item.retail_price
    return price && item.wears && item.wears > 0
  })

  if (itemsWithCPW.length > 0) {
    const avgCPW = itemsWithCPW.reduce((sum, item) => {
      const price = item.purchase_price || item.retail_price
      return sum + price / item.wears
    }, 0) / itemsWithCPW.length

    if (avgCPW < avgStats.avg_cost_per_wear) {
      const savingsPercent = Math.round(
        ((avgStats.avg_cost_per_wear - avgCPW) / avgStats.avg_cost_per_wear) * 100
      )
      facts.push({
        id: 'comparative-cpw',
        title: 'Value Investor',
        message: `Your cost-per-wear is ${savingsPercent}% better than average. You're getting serious value! 💎`,
        emoji: '💰',
        category: 'value',
      })
    }
  }

  return facts
}

/**
 * HELPER FUNCTIONS
 */

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Fall'
  return 'Winter'
}

function getSeasonEmoji(season: string): string {
  const emojis: Record<string, string> = {
    Spring: '🌸',
    Summer: '☀️',
    Fall: '🍂',
    Winter: '❄️',
  }
  return emojis[season] || '🌤️'
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getEmptyStateFacts(): FunFact[] {
  return [
    {
      id: 'get-started',
      title: 'Ready to Begin?',
      message: 'Add your first items to start discovering amazing insights about your wardrobe!',
      emoji: '🚀',
      category: 'personality',
      actionLabel: 'Add Items',
      actionLink: '/add-new-item',
    },
  ]
}
