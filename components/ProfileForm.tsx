'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'
import { AvatarEditor } from '@/components/avatar/AvatarEditor'
import { AvatarErrorBoundary } from '@/components/avatar/AvatarErrorBoundary'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useProfile } from '@/contexts/ProfileContext'

interface ProfileFormProps {
  onProfileUpdate?: () => void
}

export function ProfileForm({ onProfileUpdate }: ProfileFormProps) {
  const { profile, user, updateProfile, updateAvatar } = useProfile()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(profile?.preset_avatar_id || null)
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state when profile changes from context
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setSelectedAvatarId(profile.preset_avatar_id)
    }
  }, [profile])

  if (!profile || !user) {
    return null
  }

  // Track if there are unsaved changes
  const hasUnsavedChanges =
    displayName.trim() !== (profile.display_name || '') ||
    selectedAvatarId !== profile.preset_avatar_id

  // Manual save function with optimistic updates
  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      // Update avatar if changed
      if (selectedAvatarId && selectedAvatarId !== profile.preset_avatar_id) {
        await updateAvatar(selectedAvatarId)
      }

      // Update display name if changed
      if (displayName.trim() !== profile.display_name) {
        await updateProfile({
          display_name: displayName.trim()
        })
      }

      onProfileUpdate?.()
      toast.success('Profile saved successfully')
    } catch (error: any) {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save as fallback after 60 seconds
  const { isSaving: isAutoSaving } = useAutoSave({
    data: { display_name: displayName, preset_avatar_id: selectedAvatarId },
    onSave: async (data) => {
      if (!data.display_name.trim()) {
        throw new Error('Display name cannot be empty')
      }

      // Update avatar if changed
      if (data.preset_avatar_id && data.preset_avatar_id !== profile.preset_avatar_id) {
        await updateAvatar(data.preset_avatar_id)
      }

      // Update display name if changed
      if (data.display_name.trim() !== profile.display_name) {
        await updateProfile({
          display_name: data.display_name.trim()
        })
      }

      onProfileUpdate?.()
    },
    delay: 60000, // 60 seconds
    showToasts: false // Disable toasts for auto-save
  })

  const handleAvatarChange = (avatarId: string) => {
    setSelectedAvatarId(avatarId)
  }

  // Format the last sign in date
  const formatLastSignIn = (date: string | undefined) => {
    if (!date) return 'Never'

    const signInDate = new Date(date)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }

    return signInDate.toLocaleDateString('en-US', options)
  }

  return (
    <Card className="bg-muted px-8 py-8 ">
      <CardContent className="pt-8">
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Avatar Editor Section */}
          <AvatarErrorBoundary>
            <AvatarEditor profile={profile} user={user} onAvatarChange={handleAvatarChange} />
          </AvatarErrorBoundary>

          {/* Form Fields Section */}
          <div className="space-y-6">
            {/* Display Name */}
            <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
              <div>
                <Label htmlFor="displayName" className="text-base font-semibold text-foreground">Display Name</Label>
                <p className="text-xs text-muted-foreground mt-1">This is how others will see you</p>
              </div>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
                className="motion-safe:transition-all motion-safe:duration-200 border-stone-200 focus:ring-2 focus:ring-stone-400/40"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
              <div>
                <Label htmlFor="email" className="text-base font-semibold text-foreground">Email Address</Label>
                <p className="text-xs text-muted-foreground mt-1">Your account email cannot be changed</p>
              </div>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-muted/50 text-muted-foreground cursor-not-allowed border-stone-200/50"
              />
            </div>

            {/* Last Sign In */}
            <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-900">
              <Label className="text-base font-semibold text-foreground">Last Signed In</Label>
              <div className="text-sm text-muted-foreground/50 bg-muted/50 border border-stone-200/50 px-4 py-3 rounded-lg cursor-not-allowed ">
                {formatLastSignIn(user.last_sign_in_at)}
              </div>
            </div>
          </div>

          {/* Save Button Section */}
          <div className="pt-6 border-t border-stone-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>You have unsaved changes</span>
                  </div>
                )}
                {!hasUnsavedChanges && (
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    All changes saved
                  </p>
                )}
                {isAutoSaving && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-3">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Auto-saving...</span>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={!hasUnsavedChanges || isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Changes auto-save after 60 seconds of inactivity
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
