import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // updateSession will handle refreshing the session
  const { response, data } = await updateSession(request)
  const user = data.user

  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/login', '/cost-per-wear-calculator'] // Define public paths

  // If user is not logged in and the path is not public, redirect to login
  if (!user && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and tries to access login page, redirect to dashboard
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
'/((?!_next/static|_next/image|favicon.ico|animations|images|avatars|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',  ],
}
