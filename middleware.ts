import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { auth } from './src/lib/auth'  // Temporarily disabled - using custom JWT auth

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for auth routes and static files
  if (pathname.startsWith('/api/auth') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/appointments',
    '/prescriptions',
    '/test-results',
    '/admin',
    '/doctor',
    '/patient'
  ]

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // Temporarily disabled - using custom JWT authentication instead
  // if (isProtectedPath) {
  //   const session = await auth()
    
  //   if (!session) {
  //     const loginUrl = new URL('/login', request.url)
  //     loginUrl.searchParams.set('callbackUrl', pathname)
  //     return NextResponse.redirect(loginUrl)
  //   }

  //   // Role-based access control
  //   const userRole = (session as any).user?.role
    
  //   if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
  //     return NextResponse.redirect(new URL('/unauthorized', request.url))
  //   }
    
  //   if (pathname.startsWith('/doctor') && userRole !== 'DOCTOR') {
  //     return NextResponse.redirect(new URL('/unauthorized', request.url))
  //   }
    
  //   if (pathname.startsWith('/patient') && userRole !== 'PATIENT') {
  //     return NextResponse.redirect(new URL('/unauthorized', request.url))
  //   }
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|api|_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ]
}