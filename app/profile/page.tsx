import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/ProfileForm'
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
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: user.email?.split('@')[0] || 'User',
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    // Fetch again after creating
    const { data: createdProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProfileForm
          profile={createdProfile || { id: user.id, display_name: user.email?.split('@')[0] || 'User', avatar_url: null }}
          user={user}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProfileForm profile={profile} user={user} />
    </div>
  )
}
