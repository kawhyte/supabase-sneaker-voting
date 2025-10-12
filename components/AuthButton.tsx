import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from './ui/button'
import { signOut } from '@/app/(login)/login/actions'

export default async function AuthButton() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {user.email}
      </span>
      <form action={signOut}>
        <Button variant="outline" size="sm">
          Sign Out
        </Button>
      </form>
    </div>
  ) : (
    <Button asChild size="sm">
      <Link href="/login">Login</Link>
    </Button>
  )
}
