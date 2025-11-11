'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { ensureProfileExists } from '@/lib/ensure-profile-exists'

// Profile type definition
export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  avatar_type: 'custom' | 'preset' | null
  preset_avatar_id: string | null
  avatar_updated_at: string | null
  avatar_version: number
  updated_at: string | null
}

// Context state type
interface ProfileContextState {
  profile: UserProfile | null
  isLoading: boolean
  error: Error | null
  user: User | null
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateAvatar: (avatarId: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

// Create context with undefined default
const ProfileContext = createContext<ProfileContextState | undefined>(undefined)

// Broadcast channel name for multi-tab sync
const PROFILE_CHANNEL_NAME = 'profile-updates'

// Props for ProfileProvider
interface ProfileProviderProps {
  children: React.ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const supabaseChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Initialize Broadcast Channel for multi-tab sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(PROFILE_CHANNEL_NAME)

      // Listen for profile updates from other tabs
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'profile-updated' && event.data.profile) {
          setProfile(event.data.profile)
        }
      }

      return () => {
        channelRef.current?.close()
      }
    }
  }, [])

  // Broadcast profile updates to other tabs
  const broadcastProfileUpdate = useCallback((updatedProfile: UserProfile) => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'profile-updated',
        profile: updatedProfile
      })
    }
  }, [])

  // Fetch profile data
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, avatar_type, preset_avatar_id, avatar_updated_at, avatar_version, updated_at')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      setProfile(data)
      setError(null)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch profile')
      setError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Refresh profile (manual trigger)
  const refreshProfile = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    await fetchProfile(user.id)
  }, [user, fetchProfile])

  // Update profile with optimistic UI
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      throw new Error('No user or profile loaded')
    }

    // Optimistic update
    const optimisticProfile = { ...profile, ...updates }
    setProfile(optimisticProfile)
    broadcastProfileUpdate(optimisticProfile)

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update with real data from database
      setProfile(data)
      broadcastProfileUpdate(data)
    } catch (err) {
      // Rollback on error
      setProfile(profile)
      broadcastProfileUpdate(profile)
      throw err instanceof Error ? err : new Error('Failed to update profile')
    }
  }, [user, profile, supabase, broadcastProfileUpdate])

  // Update avatar with version increment
  const updateAvatar = useCallback(async (avatarId: string) => {
    if (!user || !profile) {
      throw new Error('No user or profile loaded')
    }

    // Optimistic update with incremented version
    const optimisticProfile: UserProfile = {
      ...profile,
      avatar_type: 'preset',
      preset_avatar_id: avatarId,
      avatar_url: null,
      avatar_version: profile.avatar_version + 1,
      avatar_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setProfile(optimisticProfile)
    broadcastProfileUpdate(optimisticProfile)

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_type: 'preset',
          preset_avatar_id: avatarId,
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update with real data (trigger will have incremented version)
      setProfile(data)
      broadcastProfileUpdate(data)
    } catch (err) {
      // Rollback on error
      setProfile(profile)
      broadcastProfileUpdate(profile)
      throw err instanceof Error ? err : new Error('Failed to update avatar')
    }
  }, [user, profile, supabase, broadcastProfileUpdate])

  // Initialize user and profile
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (!currentUser) {
          setIsLoading(false)
          return
        }

        setUser(currentUser)

        // Ensure profile exists (defensive check)
        await ensureProfileExists(supabase, currentUser.id, currentUser.email || undefined)

        // Fetch profile
        await fetchProfile(currentUser.id)

        // Subscribe to real-time updates
        const channel = supabase
          .channel('profile-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${currentUser.id}`
            },
            (payload) => {
              const updatedProfile = payload.new as UserProfile
              setProfile(updatedProfile)
              broadcastProfileUpdate(updatedProfile)
            }
          )
          .subscribe()

        supabaseChannelRef.current = channel

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize profile')
        setError(error)
        setIsLoading(false)
      }
    }

    initializeProfile()

    // Cleanup
    return () => {
      if (supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current)
      }
    }
  }, [supabase, fetchProfile, broadcastProfileUpdate])

  const value: ProfileContextState = {
    profile,
    isLoading,
    error,
    user,
    updateProfile,
    updateAvatar,
    refreshProfile
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

// Custom hook to use profile context
export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
