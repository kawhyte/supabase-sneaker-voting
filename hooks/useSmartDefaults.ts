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
 * Implements hybrid smart defaults strategy:
 * 1. Check profiles table for user preferences (cooling_off_days, duplication warnings)
 * 2. Check recent items for patterns (last brand, category, color, size)
 * 3. Return merged defaults for form initialization
 *
 * Usage:
 * ```tsx
 * const defaults = useSmartDefaults()
 *
 * useForm({
 *   defaultValues: {
 *     brand: defaults.lastBrand || '',
 *     category: defaults.lastCategory || 'shoes',
 *     color: defaults.lastColor || '',
 *     ...
 *   }
 * })
 * ```
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
