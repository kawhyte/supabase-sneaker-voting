/**
 * Card Layout Engine
 *
 * Transforms outfit items to Nike/JD Sports flat-lay layout
 * 400×480px canvas with standardized positioning
 */

import { OutfitItem, OutfitWithItems } from '@/components/types/outfit'

// Canvas dimensions
export const CARD_CANVAS_WIDTH = 400
export const CARD_CANVAS_HEIGHT = 480
export const CARD_CANVAS_RATIO = CARD_CANVAS_WIDTH / CARD_CANVAS_HEIGHT

// Max items to show on card
export const MAX_CARD_ITEMS = 6

/**
 * Nike/JD Sports positioning template
 * All positions normalized (0-1 range)
 */
export const CARD_LAYOUT_TEMPLATE: Record<string, {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}> = {
  // Shoes: Bottom-right (signature Nike position)
  shoes: {
    x: 0.7, // 70% from left
    y: 0.75, // 75% from top
    width: 0.28, // 28% of canvas width
    height: 0.25,
    zIndex: 10
  },

  // Bottoms: Center-left
  bottoms: {
    x: 0.25,
    y: 0.55,
    width: 0.3,
    height: 0.4,
    zIndex: 20
  },

  // Tops: Top-center
  tops: {
    x: 0.5,
    y: 0.3,
    width: 0.32,
    height: 0.35,
    zIndex: 30
  },

  // Outerwear: Top (layered over tops)
  outerwear: {
    x: 0.5,
    y: 0.18,
    width: 0.4,
    height: 0.42,
    zIndex: 40
  },

  // Accessories: Top-right
  accessories: {
    x: 0.85, // Top-right
    y: 0.2,
    width: 0.12,
    height: 0.12,
    zIndex: 50
  }
}

/**
 * Smart item selection - priority-based filtering to 4-6 items
 * Prioritizes: shoes, tops, bottoms, then outerwear, then accessories
 */
export function selectItemsForCard(
  items: OutfitItem[]
): OutfitItem[] {
  if (!items || items.length === 0) return []

  // Tier 1: Always show (3 slots)
  const shoes = items.find(i => i.item?.category === 'shoes')

  const tops = items.find(i => i.item?.category === 'tops')

  const bottoms = items.find(i => i.item?.category === 'bottoms')

  const tier1: OutfitItem[] = [shoes, tops, bottoms].filter(
    (item): item is OutfitItem => Boolean(item)
  )

  // Tier 2: High-impact item (outerwear)
  const outerwear = items.find(i => i.item?.category === 'outerwear')

  const tier2: OutfitItem[] = outerwear ? [outerwear] : []

  // Tier 3: Fill remaining (accessories)
  const remaining = items.filter(i =>
    !tier1.includes(i) && !tier2.includes(i)
  )

  // Sort remaining by z_index (higher = more prominent)
  remaining.sort((a, b) => (b.z_index || 0) - (a.z_index || 0))

  // Combine: max 6 items
  const selected = [
    ...tier1,
    ...tier2.slice(0, Math.min(2, MAX_CARD_ITEMS - tier1.length)),
    ...remaining.slice(0, Math.max(0, MAX_CARD_ITEMS - tier1.length - tier2.length))
  ]

  return selected.slice(0, MAX_CARD_ITEMS)
}

/**
 * Apply standardized Nike/JD positioning
 */
export function applyCardLayout(items: OutfitItem[]): OutfitItem[] {
  return items.map(item => {
    const category = item.item?.category || 'other'
    const template = CARD_LAYOUT_TEMPLATE[category] || CARD_LAYOUT_TEMPLATE.other

    // Return item with standardized position
    return {
      ...item,
      position_x: template.x,
      position_y: template.y,
      display_width: template.width,
      display_height: template.height,
      z_index: template.zIndex
    }
  })
}

/**
 * Main export: Prepare outfit for card rendering
 */
export function prepareOutfitForCard(
  outfit: OutfitWithItems
): { items: OutfitItem[]; backgroundColor: string } {
  if (!outfit.outfit_items || outfit.outfit_items.length === 0) {
    return { items: [], backgroundColor: '#F5F5F5' }
  }

  // Step 1: Smart selection (4-6 items)
  const selectedItems = selectItemsForCard(outfit.outfit_items)

  // Step 2: Apply standardized layout
  const layoutItems = applyCardLayout(selectedItems)

  // Step 3: Sort by z-index for rendering order
  const sortedItems = layoutItems.sort((a, b) =>
    (a.z_index || 0) - (b.z_index || 0)
  )

  // Step 4: Background color (default to light gray)
  const backgroundColor = outfit.background_color || '#F5F5F5'

  return { items: sortedItems, backgroundColor }
}

/**
 * Get layout position for a specific category
 * Useful for previewing item placement
 */
export function getCategoryLayoutPosition(category: string) {
  return CARD_LAYOUT_TEMPLATE[category] || CARD_LAYOUT_TEMPLATE.other
}

/**
 * Validate if items fit within card constraints
 */
export function validateCardLayout(items: OutfitItem[]): boolean {
  if (items.length === 0) return true
  if (items.length > MAX_CARD_ITEMS) return false

  // All items should have valid positions (0-1 range)
  return items.every(item =>
    item.position_x >= 0 && item.position_x <= 1 &&
    item.position_y >= 0 && item.position_y <= 1 &&
    item.display_width > 0 && item.display_width <= 1 &&
    item.display_height > 0 && item.display_height <= 1
  )
}
