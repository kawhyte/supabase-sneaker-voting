'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTabNavigation, useTabKeyboardShortcuts } from '@/hooks/useTabNavigation'
import { User, ShieldCheck, Bell } from 'lucide-react'
import { ProfileForm } from '@/components/ProfileForm'
import { PurchasePreventionSettings } from '@/components/PurchasePreventionSettings'
import { NotificationPreferences } from '@/components/NotificationPreferences'
import type { User as AuthUser } from '@supabase/supabase-js'

interface ProfileData {
  id: string
  display_name: string | null
  avatar_url: string | null
  avatar_type: 'custom' | 'preset' | null
  preset_avatar_id: string | null
  avatar_updated_at?: string
  updated_at?: string
}

function SettingsContent() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Tab navigation with hash routing
  const { activeTab, setActiveTab } = useTabNavigation('profile')

  // Keyboard shortcuts (Cmd/Ctrl + 1/2/3)
  useTabKeyboardShortcuts(
    ['profile', 'purchase-prevention', 'notifications'],
    setActiveTab
  )

  // Fetch user and profile data
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Get user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        // Redirect to login via client-side navigation
        window.location.href = '/login'
        return
      }
      setUser(currentUser)

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, avatar_type, preset_avatar_id, avatar_updated_at, updated_at')
        .eq('id', currentUser.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      } else {
        // Create default profile if doesn't exist
        setProfile({
          id: currentUser.id,
          display_name: currentUser.email?.split('@')[0] || 'User',
          avatar_url: null,
          avatar_type: 'custom',
          preset_avatar_id: null
        })
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="w-full min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* ⭐ TABBED NAVIGATION */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab List */}
          <TabsList
            data-variant="underline"
            className="w-full justify-start border-b border-stone-200 bg-transparent p-0 gap-8 mb-8"
          >
            <TabsTrigger
              value="profile"
              data-variant="underline"
              className="relative px-0 py-3 pb-4 bg-transparent flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>

            <TabsTrigger
              value="purchase-prevention"
              data-variant="underline"
              className="relative px-0 py-3 pb-4 bg-transparent flex items-center"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Purchase Prevention
            </TabsTrigger>

            <TabsTrigger
              value="notifications"
              data-variant="underline"
              className="relative px-0 py-3 pb-4 bg-transparent flex items-center"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* ⭐ TAB CONTENT */}

          {/* Profile Tab */}
          <TabsContent
            value="profile"
            className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
          >
            <ProfileForm profile={profile} user={user} />
          </TabsContent>

          {/* Purchase Prevention Tab */}
          <TabsContent
            value="purchase-prevention"
            className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
          >
            <PurchasePreventionSettings />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent
            value="notifications"
            className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
          >
            <NotificationPreferences />
          </TabsContent>
        </Tabs>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-slate-600">
            💡 <strong>Tip:</strong> Use <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Cmd</kbd> + <kbd className="px-1 py-0.5 bg-white border rounded text-xs">1/2/3</kbd> to quickly switch between tabs
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
