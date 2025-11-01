// components/avatar/AvatarEditor.tsx
'use client'

import { useState } from 'react'
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
}

export function AvatarEditor({ profile, user }: AvatarEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [currentProfile, setCurrentProfile] = useState(profile)
  const supabase = createClient()

  const handleAvatarSelect = async (avatarId: string) => {
    // Optimistic update
    const previousProfile = currentProfile
    setCurrentProfile({
      ...currentProfile,
      avatar_type: 'preset',
      preset_avatar_id: avatarId,
    })

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_type: 'preset',
          preset_avatar_id: avatarId,
          avatar_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
    } catch (error) {
      // Revert on error
      setCurrentProfile(previousProfile)
      throw error
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 pb-8 border-b border-stone-200/50">
      {/* Current Avatar Display */}
      <div className="group relative motion-safe:transition-all motion-safe:duration-300">
        <AvatarDisplay
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
