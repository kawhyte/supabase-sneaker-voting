// components/avatar/AvatarEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AvatarDisplay } from './AvatarDisplay'
import { AvatarPicker } from './AvatarPicker'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  avatar_type: 'custom' | 'preset' | null
  preset_avatar_id: string | null
}

interface AvatarEditorProps {
  profile: Profile
  user: User
  onAvatarChange?: (avatarId: string) => void
}

export function AvatarEditor({ profile, user, onAvatarChange }: AvatarEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [currentProfile, setCurrentProfile] = useState(profile)

  // Sync local state when profile prop changes
  useEffect(() => {
    console.log('🎨 [AvatarEditor] Profile prop changed:', profile.preset_avatar_id)
    setCurrentProfile(profile)
  }, [profile])

  const handleAvatarSelect = async (avatarId: string) => {
    console.log('🎨 [AvatarEditor] Avatar selected:', avatarId)

    // Update local state only
    const newProfile = {
      ...currentProfile,
      avatar_type: 'preset' as const,
      preset_avatar_id: avatarId,
    }

    console.log('🎨 [AvatarEditor] Updating local profile to:', newProfile)
    setCurrentProfile(newProfile)

    // Notify parent component of change
    console.log('🎨 [AvatarEditor] Calling onAvatarChange callback')
    onAvatarChange?.(avatarId)
    setIsPickerOpen(false)
  }

  return (
    <div className="flex flex-col items-center gap-6 pb-8 border-b border-stone-200/50">
      {/* Current Avatar Display */}
      <div className="group relative motion-safe:transition-all motion-safe:duration-300">
        <AvatarDisplay
          key={currentProfile.preset_avatar_id || 'default'}
          avatarType={currentProfile.avatar_type}
          avatarUrl={currentProfile.avatar_url}
          presetAvatarId={currentProfile.preset_avatar_id}
          displayName={currentProfile.display_name}
          email={user.email}
          size="xl"
          className="ring-2 ring-stone-300/40"
        />
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 motion-safe:transition-colors motion-safe:duration-300"></div>
      </div>

      {/* Change Avatar Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsPickerOpen(true)}
        className="motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-105"
      >
        Change Avatar
      </Button>

      {/* Avatar Picker Modal */}
      <AvatarPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentAvatarId={currentProfile.preset_avatar_id}
        onSelect={handleAvatarSelect}
      />
    </div>
  )
}
