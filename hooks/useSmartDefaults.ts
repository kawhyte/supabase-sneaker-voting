import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { ItemCategory } from '@/components/types/item-category'

interface SmartDefaults {
  preferredCoolingOffDays?: number
  enableDuplicationWarnings?: boolean
  lastBrand?: string
  lastBrandId?: number
  lastCategory?: ItemCategory
  lastColor?: string
  lastSize?: string
  isLoading: boolean
  error?: string
}

/**
 * useSmartDefaults - Load smart defaults from user profile and recent items
 *
 * Implements hybrid smart defaults strategy for better UX in forms:
 * 1. Query profiles table for user preferences (cooling_off_days, duplication warnings)
 * 2. Query recent items for usage patterns (last brand, category, color, size)
 * 3. Merge results with sensible fallbacks and return for form initialization
 *
 * This hook reduces form friction by pre-populating fields based on user history.
 * For example, if the user's last added item was a Nike shoe in red size 10,
 * the next form will default to Nike, shoe category, red, size 10.
 *
 * Performance: Runs once on mount (empty dependency array), loads user's first
 * owned non-archived item from recent-first order (indexed query).
 *
 * Error Handling: Silently handles missing profile (PGRST116 = not found) or
 * recent items. Returns isLoading=false and provides fallback values.
 *
 * @returns SmartDefaults object with user preferences, recent patterns, and loading state
 *
 * @example
 * const defaults = useSmartDefaults();
 *
 * if (defaults.isLoading) return <Spinner />;
 *
 * return (
 *   <form>
 *     <BrandInput defaultValue={defaults.lastBrand} />
 *     <CategorySelect defaultValue={defaults.lastCategory} />
 *     <ColorInput defaultValue={defaults.lastColor} />
 *   </form>
 * );
 *
 * @see SmartDefaults for the returned object structure
 */
export function useSmartDefaults(): SmartDefaults {
  const [defaults, setDefaults] = useState<SmartDefaults>({
    isLoading: true,
  })

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const supabase = await createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setDefaults({ isLoading: false })
          return
        }

        // Load profile preferences
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('preferred_cooling_off_days, enable_duplication_warnings')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile load error:', profileError)
        }

        // Load recent item for pattern detection
        const { data: recentItem, error: itemError } = await supabase
          .from('items')
          .select('brand, brand_id, category, color, size_tried')
          .eq('user_id', user.id)
          .eq('status', 'owned')
          .is('is_archived', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (itemError && itemError.code !== 'PGRST116') {
          console.error('Recent item load error:', itemError)
        }

        setDefaults({
          preferredCoolingOffDays: profile?.preferred_cooling_off_days ?? 7,
          enableDuplicationWarnings: profile?.enable_duplication_warnings ?? true,
          lastBrand: recentItem?.brand || undefined,
          lastBrandId: recentItem?.brand_id || undefined,
          lastCategory: (recentItem?.category as ItemCategory) || undefined,
          lastColor: recentItem?.color || undefined,
          lastSize: recentItem?.size_tried || undefined,
          isLoading: false,
        })
      } catch (error) {
        console.error('Smart defaults error:', error)
        setDefaults({
          isLoading: false,
          error: 'Failed to load preferences',
        })
      }
    }

    loadDefaults()
  }, [])

  return defaults
}
