import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from './ui/button'
import { UserMenu } from './UserMenu'

// Helper function to generate initials from display name or email
function getInitials(displayName: string | null, email: string | undefined): string {
  if (displayName) {
    const names = displayName.trim().split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return displayName.substring(0, 2).toUpperCase()
  }

  if (email) {
    return email.substring(0, 2).toUpperCase()
  }

  return 'U'
}

export default async function AuthButton() {
  const supabase = await createClient()

  // Fetch user from auth
  const { data: { user } } = await supabase.auth.getUser()

  // If no user, show login button
  if (!user) {
    return (
      <Button asChild size="sm">
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  // Fetch user profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url || null
  const initials = getInitials(profile?.display_name || null, user.email)

  return (
    <UserMenu
      displayName={displayName}
      email={user.email || ''}
      avatarUrl={avatarUrl}
      initials={initials}
    />
  )
}
