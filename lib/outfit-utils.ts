/**
 * Outfit Utilities
 *
 * Database operations for creating, reading, updating, and deleting outfits
 * Includes filtering, sorting, and outfit statistics calculations
 */

import { createClient } from '@/utils/supabase/client';
import {
  Outfit,
  OutfitItem,
  OutfitWithItems,
  OutfitCreateInput,
  OutfitUpdateInput,
  OutfitItemCreateInput,
  OutfitItemUpdateInput,
  OutfitFilter,
  OutfitStats,
  OutfitOccasion,
} from '@/components/types/Outfit';
import { WardrobeItem } from '@/components/types/WardrobeItem';

const supabase = createClient();

/**
 * Create a new outfit
 */
export async function createOutfit(input: OutfitCreateInput): Promise<Outfit | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('outfits')
      .insert({
        user_id: user.id,
        ...input,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating outfit:', error);
    return null;
  }
}

/**
 * Get all outfits for current user
 */
export async function getOutfits(filter?: OutfitFilter): Promise<Outfit[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('outfits')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (filter?.occasion) {
      query = query.eq('occasion', filter.occasion);
    }

    if (filter?.is_archived !== undefined) {
      query = query.eq('is_archived', filter.is_archived);
    }

    if (filter?.search) {
      query = query.or(
        `name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`
      );
    }

    if (filter?.date_range) {
      query = query
        .gte('date_created', filter.date_range.start)
        .lte('date_created', filter.date_range.end);
    }

    // Apply sorting
    let orderBy = 'created_at';
    let ascending = false;

    if (filter?.sort_by === 'oldest') {
      orderBy = 'created_at';
      ascending = true;
    } else if (filter?.sort_by === 'most_worn') {
      orderBy = 'times_worn';
      ascending = false;
    } else if (filter?.sort_by === 'recently_worn') {
      orderBy = 'last_worn';
      ascending = false;
    }

    query = query.order(orderBy, { ascending });

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return [];
  }
}

/**
 * Get a single outfit with all items
 */
export async function getOutfitById(outfitId: string): Promise<OutfitWithItems | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .select('*')
      .eq('id', outfitId)
      .eq('user_id', user.id)
      .single();

    if (outfitError) throw outfitError;

    // Get outfit items with related item data
    const { data: outfitItems, error: itemsError } = await supabase
      .from('outfit_items')
      .select(
        `
        *,
        item:item_id(*)
      `
      )
      .eq('outfit_id', outfitId)
      .order('z_index', { ascending: true });

    if (itemsError) throw itemsError;

    return {
      ...outfit,
      outfit_items: outfitItems || [],
    } as OutfitWithItems;
  } catch (error) {
    console.error('Error fetching outfit:', error);
    return null;
  }
}

/**
 * Update an outfit
 */
export async function updateOutfit(
  outfitId: string,
  input: OutfitUpdateInput
): Promise<Outfit | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('outfits')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', outfitId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating outfit:', error);
    return null;
  }
}

/**
 * Delete an outfit
 */
export async function deleteOutfit(outfitId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', outfitId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting outfit:', error);
    return false;
  }
}

/**
 * Add an item to an outfit
 */
export async function addOutfitItem(
  outfitId: string,
  input: OutfitItemCreateInput
): Promise<OutfitItem | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify outfit ownership
    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .select('id')
      .eq('id', outfitId)
      .eq('user_id', user.id)
      .single();

    if (outfitError || !outfit) throw new Error('Outfit not found');

    const { data, error } = await supabase
      .from('outfit_items')
      .insert({
        outfit_id: outfitId,
        ...input,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding outfit item:', error);
    return null;
  }
}

/**
 * Update an outfit item
 */
export async function updateOutfitItem(
  outfitItemId: string,
  input: OutfitItemUpdateInput
): Promise<OutfitItem | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify ownership through outfit relationship
    const { data: itemData, error: itemError } = await supabase
      .from('outfit_items')
      .select('outfit_id')
      .eq('id', outfitItemId)
      .single();

    if (itemError || !itemData) throw new Error('Outfit item not found');

    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .select('id')
      .eq('id', itemData.outfit_id)
      .eq('user_id', user.id)
      .single();

    if (outfitError || !outfit) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('outfit_items')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', outfitItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating outfit item:', error);
    return null;
  }
}

/**
 * Remove an item from an outfit
 */
export async function removeOutfitItem(outfitItemId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify ownership
    const { data: itemData, error: itemError } = await supabase
      .from('outfit_items')
      .select('outfit_id')
      .eq('id', outfitItemId)
      .single();

    if (itemError || !itemData) throw new Error('Outfit item not found');

    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .select('id')
      .eq('id', itemData.outfit_id)
      .eq('user_id', user.id)
      .single();

    if (outfitError || !outfit) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('outfit_items')
      .delete()
      .eq('id', outfitItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing outfit item:', error);
    return false;
  }
}

/**
 * Mark an outfit as worn
 */
export async function markOutfitAsWorn(outfitId: string): Promise<Outfit | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('outfits')
      .update({
        date_worn: now,
        last_worn: now,
        times_worn: supabase.rpc('increment_times_worn', { outfit_id: outfitId }),
      })
      .eq('id', outfitId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking outfit as worn:', error);
    return null;
  }
}

/**
 * Get outfit statistics for current user
 */
export async function getOutfitStats(): Promise<OutfitStats | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get all outfits
    const { data: outfits, error: outfitsError } = await supabase
      .from('outfits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false);

    if (outfitsError) throw outfitsError;

    const totalOutfits = outfits?.length || 0;
    const totalWears = outfits?.reduce((sum, o) => sum + (o.times_worn || 0), 0) || 0;
    const averageWears = totalOutfits > 0 ? totalWears / totalOutfits : 0;

    // Find most worn outfit
    let mostWornOutfitId: string | undefined;
    let mostWornCount = 0;
    if (outfits && outfits.length > 0) {
      const sorted = [...outfits].sort((a, b) => (b.times_worn || 0) - (a.times_worn || 0));
      if (sorted[0]) {
        mostWornOutfitId = sorted[0].id;
        mostWornCount = sorted[0].times_worn || 0;
      }
    }

    // Count outfits by occasion
    const outfitsByOccasion: Record<OutfitOccasion, number> = {
      casual: 0,
      work: 0,
      date: 0,
      gym: 0,
      formal: 0,
      travel: 0,
      weekend: 0,
      night_out: 0,
      other: 0,
    };

    outfits?.forEach((outfit) => {
      if (outfit.occasion && outfit.occasion in outfitsByOccasion) {
        outfitsByOccasion[outfit.occasion as OutfitOccasion]++;
      } else {
        outfitsByOccasion.other++;
      }
    });

    // Count unique items used
    const { data: allItems, error: itemsError } = await supabase
      .from('outfit_items')
      .select('item_id')
      .in(
        'outfit_id',
        outfits?.map((o) => o.id) || []
      );

    if (itemsError) throw itemsError;

    const uniqueItems = new Set(allItems?.map((i) => i.item_id) || []);

    return {
      total_outfits: totalOutfits,
      total_wears: totalWears,
      average_wears_per_outfit: averageWears,
      most_worn_outfit_id: mostWornOutfitId,
      most_worn_outfit_count: mostWornCount,
      outfits_by_occasion: outfitsByOccasion,
      items_used_count: uniqueItems.size,
    };
  } catch (error) {
    console.error('Error getting outfit stats:', error);
    return null;
  }
}

/**
 * Get suggested outfits based on user's wardrobe
 * Simple algorithm: random combinations with category balance
 */
export async function suggestOutfitCombination(
  userWardrobe: WardrobeItem[]
): Promise<WardrobeItem[]> {
  try {
    // Group items by category
    const byCategory: Record<string, WardrobeItem[]> = {};

    userWardrobe.forEach((item) => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    });

    // Select random items from each category
    const suggested: WardrobeItem[] = [];

    Object.values(byCategory).forEach((items) => {
      if (items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        suggested.push(items[randomIndex]);
      }
    });

    return suggested;
  } catch (error) {
    console.error('Error suggesting outfit combination:', error);
    return [];
  }
}

/**
 * Calculate layout positions for auto-arrange
 * Positions items vertically based on category
 */
export function calculateAutoPositions(
  items: WardrobeItem[]
): Array<{
  item_id: string;
  position_x: number;
  position_y: number;
  z_index: number;
}> {
  const categoryOrder: Record<string, { y: number; z: number }> = {
    shoes: { y: 0.85, z: 0 },
    bottoms: { y: 0.6, z: 1 },
    tops: { y: 0.4, z: 2 },
    outerwear: { y: 0.25, z: 3 },
    accessories: { y: 0.15, z: 4 },
    bags: { y: 0.75, z: 4 },
    hats: { y: 0.1, z: 4 },
    other: { y: 0.5, z: 2 },
  };

  return items.map((item) => {
    const pos = categoryOrder[item.category] || { y: 0.5, z: 2 };

    return {
      item_id: item.id,
      position_x: 0.5, // Center horizontally
      position_y: pos.y,
      z_index: pos.z,
    };
  });
}
