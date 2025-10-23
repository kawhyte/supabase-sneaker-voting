import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile-form'
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
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create a default one
  if (profileError || !profile) {
    // Fetch again after creating
    const { data: createdProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return (
      <div className="max-w-[820px] mx-auto">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-base text-muted-foreground">Manage your profile information and preferences</p>
        </div>
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <ProfileForm
            profile={createdProfile || { id: user.id, display_name: user.email?.split('@')[0] || 'User', avatar_url: null }}
            user={user}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[820px] mx-auto  border border-accent-background rounded-2xl ">
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 mb-8  pt-8 px-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-base text-muted-foreground">Manage your profile information and preferences</p>
      </div>
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 p-8">
        <ProfileForm profile={profile} user={user} />
      </div>
    </div>
  )
}
