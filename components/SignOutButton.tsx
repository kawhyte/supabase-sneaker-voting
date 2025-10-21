'use client'

import { useFormStatus } from 'react-dom'
import { LogOut, Loader2 } from 'lucide-react'
import { type ButtonHTMLAttributes } from 'react'

/**
 * Sign out button with loading state.
 * Uses React's useFormStatus hook to show pending state during logout.
 * Designed to work as a child of DropdownMenuItem with asChild.
 */
export function SignOutButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      type="submit"
      disabled={pending}
      className="flex w-full items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={pending ? 'Signing out...' : 'Sign out'}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign Out
        </>
      )}
    </button>
  )
}
