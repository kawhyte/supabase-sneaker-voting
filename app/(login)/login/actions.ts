'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Check if an error is a Next.js redirect error.
 * Next.js throws special errors for redirects that should be re-thrown.
 */
function isRedirectError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof error.digest === 'string'
  ) {
    return error.digest.startsWith('NEXT_REDIRECT')
  }
  return false
}

/**
 * Authenticates a user with email and password.
 * Revalidates the app cache on successful login.
 * @param formData - Form data containing email and password
 */
export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error.message)
      return redirect('/login?message=Could not authenticate user. Please check your credentials.')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error) {
    // Next.js redirect() throws a special error - we need to re-throw it
    if (isRedirectError(error)) {
      throw error
    }
    console.error('Unexpected login error:', error)
    return redirect('/login?message=An unexpected error occurred. Please try again.')
  }
}

/**
 * Signs out the current user and clears the session.
 * Revalidates the entire app cache to ensure fresh data on next login.
 */
export async function signOut() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error.message)
      return redirect('/login?message=Unable to sign out. Please try again.')
    }

    // Clear all cached data - critical for proper logout
    revalidatePath('/', 'layout')

    redirect('/login?message=Successfully signed out')
  } catch (error) {
    // Next.js redirect() throws a special error - we need to re-throw it
    if (isRedirectError(error)) {
      throw error
    }
    console.error('Unexpected logout error:', error)
    return redirect('/login?message=An unexpected error occurred during sign out')
  }
}
