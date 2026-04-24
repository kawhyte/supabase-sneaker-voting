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
import { createClient } from '@/utils/supabase/client'
import { getPointsProgress } from '@/lib/level-system'

interface ProfileFormProps {
  onProfileUpdate?: () => void
}

export function ProfileForm({ onProfileUpdate }: ProfileFormProps) {
  const { profile, user, updateProfile, updateAvatar } = useProfile()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(profile?.preset_avatar_id || null)
  const [isSaving, setIsSaving] = useState(false)
  const [totalPoints, setTotalPoints] = useState<number | null>(null)

  // Sync local state when profile changes from context
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setSelectedAvatarId(profile.preset_avatar_id)
    }
  }, [profile])

  // Fetch achievement points for Collector Tier display
  useEffect(() => {
    if (!user?.id) return
    const supabase = createClient()
    async function fetchPoints() {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('achievements!inner(points)')
          .eq('user_id', user!.id)
        if (error || !data) { setTotalPoints(0); return }
        setTotalPoints(
          data.reduce((sum: number, row: any) => sum + (row.achievements?.points ?? 0), 0)
        )
      } catch {
        setTotalPoints(0)
      }
    }
    fetchPoints()
  }, [user?.id])

  if (!profile || !user) {
    return null
  }

  // Track if there are unsaved changes
  const hasUnsavedChanges =
    displayName.trim() !== (profile.display_name || '') ||
    selectedAvatarId !== profile.preset_avatar_id

  // Shared save logic used by both manual save and auto-save
  const saveChanges = async (name: string, avatarId: string | null) => {
    if (avatarId && avatarId !== profile.preset_avatar_id) {
      await updateAvatar(avatarId)
    }
    if (name.trim() !== profile.display_name) {
      await updateProfile({ display_name: name.trim() })
    }
    onProfileUpdate?.()
  }

  // Manual save with validation and toast feedback
  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      await saveChanges(displayName, selectedAvatarId)
      toast.success('Profile saved successfully')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save as fallback after 60 seconds (no toast)
  const { isSaving: isAutoSaving } = useAutoSave({
    data: { display_name: displayName, preset_avatar_id: selectedAvatarId },
    onSave: async (data) => {
      if (!data.display_name.trim()) throw new Error('Display name cannot be empty')
      await saveChanges(data.display_name, data.preset_avatar_id)
    },
    delay: 60000,
    showToasts: false
  })

  const tierProgress = totalPoints !== null ? getPointsProgress(totalPoints) : null

  return (
    <Card className="bg-card border border-border rounded-2xl px-8 py-8">
      <CardContent>
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Avatar Editor Section */}
          <AvatarErrorBoundary>
            <AvatarEditor profile={profile} user={user} onAvatarChange={setSelectedAvatarId} />
          </AvatarErrorBoundary>

          {/* Collector Tier */}
          <div className="flex flex-col items-center gap-2 pb-2">
            {tierProgress === null ? (
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            ) : (
              <>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Collector Tier</p>
                <p className="text-sm font-semibold text-foreground">
                  Level {tierProgress.level} · {tierProgress.tierName}
                </p>
                <div className="w-32 h-0.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full motion-safe:transition-all motion-safe:duration-700"
                    style={{ width: `${tierProgress.progressPct}%` }}
                    role="progressbar"
                    aria-valuenow={tierProgress.progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </>
            )}
          </div>

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
                className="motion-safe:transition-all motion-safe:duration-200 border-border focus:ring-2 focus:ring-slate-400/40"
              />
            </div>

            {/* Email (Read-only typography) */}
            <div className="space-y-1 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
              <Label className="text-base font-semibold text-foreground">Email Address</Label>
              <p className="text-xs text-muted-foreground">Your account email cannot be changed</p>
              <p className="text-sm text-muted-foreground pt-1">{user.email || '—'}</p>
            </div>
          </div>

          {/* Save Button Section */}
          <div className="pt-6 border-t border-border/50">
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
