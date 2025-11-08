'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'
import { Loader2, Check } from 'lucide-react'
import { AvatarEditor } from '@/components/avatar/AvatarEditor'
import { AvatarErrorBoundary } from '@/components/avatar/AvatarErrorBoundary'
import { useAutoSave } from '@/hooks/useAutoSave'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  avatar_type: 'custom' | 'preset' | null
  preset_avatar_id: string | null
  avatar_updated_at?: string | null
  updated_at?: string | null
}

interface ProfileFormProps {
  profile: Profile
  user: User
}

export function ProfileForm({ profile, user }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const supabase = createClient()

  // Auto-save display name changes
  const { isSaving: isAutoSaving, hasUnsavedChanges } = useAutoSave({
    data: { display_name: displayName },
    onSave: async (data, signal) => {
      if (!data.display_name.trim()) {
        throw new Error('Display name cannot be empty')
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .abortSignal(signal)

      if (error) throw error
    },
    delay: 1000,
    showToasts: true
  })

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
    <Card className=" ">
      {/* <CardHeader className="pb-6 border-b border-stone-200/50">
        <CardTitle className="text-2xl font-bold text-foreground">Profile Information</CardTitle>
        <CardDescription className="text-base text-muted-foreground">Update your personal details and profile picture</CardDescription>
      </CardHeader> */}
      <CardContent className="pt-8">
        <form className="space-y-8">
          {/* Avatar Editor Section */}
          <AvatarErrorBoundary>
            <AvatarEditor profile={profile} user={user} />
          </AvatarErrorBoundary>

          {/* Form Fields Section */}
          <div className="space-y-6">
            {/* Display Name */}
            <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="displayName" className="text-base font-semibold text-foreground">Display Name</Label>
                  <p className="text-xs text-muted-foreground mt-1">This is how others will see you</p>
                </div>
                {/* Auto-save status indicator */}
                {isAutoSaving && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {!isAutoSaving && !hasUnsavedChanges && displayName !== profile.display_name && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    <span>Saved</span>
                  </div>
                )}
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
              <div className="text-sm text-foreground bg-stone-50/50 border border-stone-200/50 px-4 py-3 rounded-lg">
                {formatLastSignIn(user.last_sign_in_at)}
              </div>
            </div>
          </div>

          {/* Auto-save info */}
          <div className="pt-6 border-t border-stone-200/50">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Check className="h-3 w-3" />
              Changes are saved automatically
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
