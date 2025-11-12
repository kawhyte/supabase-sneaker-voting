'use client'

import { useState, useMemo } from 'react'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { OutfitItem } from '@/components/types/outfit'
import { ItemSearchBar } from './ItemSearchBar'
import { CategoryTabs, CategoryFilter } from './CategoryTabs'
import { ItemCard } from './ItemCard'

interface ItemLibraryProps {
  userWardrobe: WardrobeItem[]
  outfitItems: OutfitItem[]
  onAddItem: (item: WardrobeItem) => void
  canAddItem: (item: WardrobeItem) => { canAdd: boolean; reason?: string }
}

/**
 * ItemLibrary - Left sidebar with search, category tabs, and item grid
 * Features:
 * - Real-time search by brand, model, color
 * - Category filtering (All, Tops, Bottoms, Shoes, Accessories)
 * - Visual grid with hover effects
 * - Shows which items are already in outfit
 * - Quota validation (disables items that can't be added)
 * - Empty states for no items/no search results
 */
export function ItemLibrary({ userWardrobe, outfitItems, onAddItem, canAddItem }: ItemLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')

  // Category mapping (groups similar categories)
  const getCategoryGroup = (itemCategory: string): CategoryFilter => {
    const cat = itemCategory.toLowerCase()

    // Tops: tops, shirts, sweaters, outerwear
    if (['tops', 'shirts', 'sweaters', 'outerwear', 'jackets', 'coats'].includes(cat)) {
      return 'tops'
    }

    // Bottoms: bottoms, pants, shorts, skirts
    if (['bottoms', 'pants', 'shorts', 'skirts'].includes(cat)) {
      return 'bottoms'
    }

    // Shoes: sneakers, shoes
    if (['sneakers', 'shoes'].includes(cat)) {
      return 'shoes'
    }

    // Accessories: everything else
    return 'accessories'
  }

  // Filter items by search and category
  const filteredItems = useMemo(() => {
    let items = userWardrobe

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        item =>
          item.brand?.toLowerCase().includes(query) ||
          item.model?.toLowerCase().includes(query) ||
          item.color?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (activeCategory !== 'all') {
      items = items.filter(item => {
        const itemGroup = getCategoryGroup(item.category || 'other')
        return itemGroup === activeCategory
      })
    }

    return items
  }, [userWardrobe, searchQuery, activeCategory])

  // Calculate item counts per category
  const categoryCounts = useMemo(() => {
    return {
      all: userWardrobe.length,
      tops: userWardrobe.filter(item => getCategoryGroup(item.category || 'other') === 'tops').length,
      bottoms: userWardrobe.filter(item => getCategoryGroup(item.category || 'other') === 'bottoms').length,
      shoes: userWardrobe.filter(item => getCategoryGroup(item.category || 'other') === 'shoes').length,
      accessories: userWardrobe.filter(item => getCategoryGroup(item.category || 'other') === 'accessories').length,
    }
  }, [userWardrobe])

  return (
    <div className="bg-white dark:bg-[#1a2b2f] rounded-xl shadow-sm p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold text-[#111718] dark:text-white mb-4">My Wardrobe</h3>

      {/* Search Bar */}
      <div className="mb-3">
        <ItemSearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Category Tabs */}
      <div className="mb-3">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          itemCounts={categoryCounts}
        />
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto">
        {userWardrobe.length === 0 ? (
          // No items in wardrobe
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No items in wardrobe</p>
            <p className="text-xs text-muted-foreground mt-1">Add items to your collection first</p>
          </div>
        ) : filteredItems.length === 0 ? (
          // No search/filter results
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No items found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          // Item Grid
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 pb-2">
            {filteredItems.map(item => {
              const isInOutfit = outfitItems.some(oi => oi.item_id === item.id)
              const { canAdd, reason } = canAddItem(item)
              const isDisabled = isInOutfit || !canAdd

              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => onAddItem(item)}
                  isDisabled={isDisabled}
                  isInOutfit={isInOutfit}
                  disabledReason={isInOutfit ? 'Already in outfit' : reason}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
