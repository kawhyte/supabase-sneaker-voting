import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // updateSession will handle refreshing the session
  const { response, data } = await updateSession(request)
  const user = data.user

  const { pathname } = request.nextUrl

  // If user is not logged in and not on the login page, redirect to login
  if (!user && pathname !== '/login') {
    return Response.redirect(new URL('/login', request.url))
  }

  // If user IS logged in and tries to access login page, redirect to dashboard
  if (user && pathname === '/login') {
    return Response.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
