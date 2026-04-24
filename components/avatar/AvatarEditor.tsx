// components/avatar/AvatarEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import { Camera } from 'lucide-react'
import { AvatarDisplay } from './AvatarDisplay'
import { AvatarPicker } from './AvatarPicker'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  avatar_type: 'custom' | 'preset' | null
  preset_avatar_id: string | null
  avatar_version?: number
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
    setCurrentProfile(profile)
  }, [profile])

  const handleAvatarSelect = async (avatarId: string) => {
    // Update local state optimistically
    const newProfile = {
      ...currentProfile,
      avatar_type: 'preset' as const,
      preset_avatar_id: avatarId,
      avatar_version: (currentProfile.avatar_version || 1) + 1
    }

    setCurrentProfile(newProfile)

    // Notify parent component of change
    onAvatarChange?.(avatarId)
    setIsPickerOpen(false)
  }

  return (
    <div className="flex flex-col items-center gap-3 pb-8 border-b border-slate-200/50">
      {/* Current Avatar Display — clickable with camera overlay */}
      <div
        className="group relative motion-safe:transition-all motion-safe:duration-300 cursor-pointer"
        onClick={() => setIsPickerOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Change avatar"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsPickerOpen(true) }}
      >
        <AvatarDisplay
          key={currentProfile.preset_avatar_id || 'default'}
          avatarType={currentProfile.avatar_type}
          avatarUrl={currentProfile.avatar_url}
          presetAvatarId={currentProfile.preset_avatar_id}
          avatarVersion={currentProfile.avatar_version}
          displayName={currentProfile.display_name}
          email={user.email}
          size="xl"
          className="ring-2 ring-slate-300/40"
        />
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/30 motion-safe:transition-all motion-safe:duration-300">
          <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-300" aria-hidden="true" />
        </div>
      </div>

      {/* Minimal text link */}
      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        className="text-xs text-muted-foreground underline-offset-2 hover:underline hover:text-foreground motion-safe:transition-colors motion-safe:duration-150"
      >
        Edit photo
      </button>

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
