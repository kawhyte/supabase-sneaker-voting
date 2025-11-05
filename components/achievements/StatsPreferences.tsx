'use client'

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export interface StatsPreferencesType {
  show_total_spent: boolean
  show_category_spending: boolean
  show_spending_trends: boolean
  show_wardrobe_size: boolean
  show_total_saved: boolean
  show_least_worn: boolean
  show_comparative_stats: boolean
}

const DEFAULT_PREFERENCES: StatsPreferencesType = {
  show_total_spent: true,
  show_category_spending: true,
  show_spending_trends: true,
  show_wardrobe_size: true,
  show_total_saved: true,
  show_least_worn: true,
  show_comparative_stats: true,
}

interface StatsPreferencesProps {
  userId: string
  onPreferencesChange?: (preferences: StatsPreferencesType) => void
}

export function StatsPreferences({ userId, onPreferencesChange }: StatsPreferencesProps) {
  const [preferences, setPreferences] = useState<StatsPreferencesType>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [userId])

  async function loadPreferences() {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_stats')
        .select('achievements_preferences')
        .eq('user_id', userId)
        .single()

      if (data?.achievements_preferences) {
        const merged = { ...DEFAULT_PREFERENCES, ...data.achievements_preferences }
        setPreferences(merged)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function savePreferences(newPreferences: StatsPreferencesType) {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_stats')
        .update({ achievements_preferences: newPreferences })
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to save preferences:', error)
        toast.error('Failed to save preferences')
      } else {
        setPreferences(newPreferences)
        onPreferencesChange?.(newPreferences)
        toast.success('Preferences saved')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('An error occurred while saving preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePreference = (key: keyof StatsPreferencesType) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] }
    savePreferences(newPreferences)
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Settings className="h-4 w-4" />
        Loading...
      </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Stats Preferences</SheetTitle>
          <SheetDescription>
            Choose which stats to display on your achievements page
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Financial Stats */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Financial Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="total-spent" className="flex-1">
                  Show Total Spent
                </Label>
                <Switch
                  id="total-spent"
                  checked={preferences.show_total_spent}
                  onCheckedChange={() => togglePreference('show_total_spent')}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="category-spending" className="flex-1">
                  Show Category Breakdown
                </Label>
                <Switch
                  id="category-spending"
                  checked={preferences.show_category_spending}
                  onCheckedChange={() => togglePreference('show_category_spending')}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="spending-trends" className="flex-1">
                  Show Spending Trends
                </Label>
                <Switch
                  id="spending-trends"
                  checked={preferences.show_spending_trends}
                  onCheckedChange={() => togglePreference('show_spending_trends')}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="total-saved" className="flex-1">
                  Show Total Saved
                </Label>
                <Switch
                  id="total-saved"
                  checked={preferences.show_total_saved}
                  onCheckedChange={() => togglePreference('show_total_saved')}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Collection Stats */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Collection Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="wardrobe-size" className="flex-1">
                  Show Wardrobe Growth
                </Label>
                <Switch
                  id="wardrobe-size"
                  checked={preferences.show_wardrobe_size}
                  onCheckedChange={() => togglePreference('show_wardrobe_size')}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="least-worn" className="flex-1">
                  Show Least Worn Items
                </Label>
                <Switch
                  id="least-worn"
                  checked={preferences.show_least_worn}
                  onCheckedChange={() => togglePreference('show_least_worn')}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Comparative Stats */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
              Comparative Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="comparative-stats" className="flex-1">
                  Show vs Average User
                </Label>
                <Switch
                  id="comparative-stats"
                  checked={preferences.show_comparative_stats}
                  onCheckedChange={() => togglePreference('show_comparative_stats')}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
