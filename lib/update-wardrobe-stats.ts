/**
 * UPDATE WARDROBE STATS
 *
 * Purpose: Recalculate user_stats table after wardrobe changes
 * Called: After adding/removing items, creating outfits, marking items worn
 */

import { createClient } from '@/utils/supabase/server'

export async function updateWardrobeStats(userId: string) {
  const supabase = await createClient()

  try {
    // Get all items
    const { data: allItems } = await supabase
      .from('sneakers')
      .select('status, purchase_price, wears')
      .eq('user_id', userId)

    const ownedItems = allItems?.filter((i: any) => i.status === 'owned') || []
    const wishlistedItems = allItems?.filter((i: any) => i.status === 'wishlisted') || []

    // Calculate total spent
    const totalSpent = ownedItems.reduce(
      (sum: number, item: any) => sum + (item.purchase_price || 0),
      0
    )

    // Calculate average cost per wear
    const itemsWithWears = ownedItems.filter((i: any) => i.wears && i.wears > 0)
    const avgCPW = itemsWithWears.length > 0
      ? itemsWithWears.reduce(
          (sum: number, item: any) => sum + (item.purchase_price || 0) / (item.wears || 1),
          0
        ) / itemsWithWears.length
      : 0

    // Get most worn item
    const mostWornItem = ownedItems.reduce(
      (max: any, item: any) =>
        (item.wears || 0) > (max.wears || 0) ? item : max,
      { id: null, wears: 0 }
    )

    // Get total outfits
    const { count: totalOutfits } = await supabase
      .from('outfits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_archived', false)

    // Get savings from price alerts
    const { data: alerts } = await supabase
      .from('price_alerts')
      .select('previous_price, current_price')
      .eq('user_id', userId)

    const totalSavings = alerts?.reduce(
      (sum: number, alert: any) => sum + ((alert.previous_price || 0) - (alert.current_price || 0)),
      0
    ) || 0

    // Update stats
    await supabase
      .from('user_stats')
      .update({
        total_items: allItems?.length || 0,
        owned_items: ownedItems.length,
        wishlisted_items: wishlistedItems.length,
        total_outfits: totalOutfits || 0,
        total_spent: totalSpent,
        average_cost_per_wear: avgCPW,
        total_savings_from_alerts: totalSavings,
        most_worn_item_id: mostWornItem.id,
        most_worn_count: mostWornItem.wears || 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    console.log(`Updated stats for user ${userId}`)
  } catch (error) {
    console.error('Error updating wardrobe stats:', error)
  }
}
