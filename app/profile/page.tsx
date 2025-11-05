import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/ProfileForm'
import { PurchasePreventionSettings } from '@/components/PurchasePreventionSettings'
import { NotificationPreferences } from '@/components/NotificationPreferences'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile Settings',
  description: 'Manage your profile information and preferences',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, avatar_type, preset_avatar_id, avatar_updated_at, updated_at')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create a default one
  if (profileError || !profile) {
    // Fetch again after creating
    const { data: createdProfile } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, avatar_type, preset_avatar_id, avatar_updated_at, updated_at')
      .eq('id', user.id)
      .single()

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences, notifications, and purchase prevention settings
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          {/* Profile Information */}
          <ProfileForm
            profile={createdProfile || { id: user.id, display_name: user.email?.split('@')[0] || 'User', avatar_url: null, avatar_type: 'custom', preset_avatar_id: null, avatar_updated_at: undefined, updated_at: undefined }}
            user={user}
          />

          {/* Smart Purchase Prevention */}
          <PurchasePreventionSettings />

          {/* Notification Preferences */}
          <NotificationPreferences />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences, notifications, and purchase prevention settings
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        {/* Profile Information */}
        <ProfileForm profile={profile} user={user} />

        {/* Smart Purchase Prevention */}
        <PurchasePreventionSettings />

        {/* Notification Preferences */}
        <NotificationPreferences />
      </div>
    </div>
  )
}
