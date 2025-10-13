import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    console.log('Session API - checking for auth token')
    console.log('Session API - cookies:', request.cookies.getAll().map(c => c.name))
    
    const token = request.cookies.get('auth-token')?.value
    console.log('Session API - token found:', !!token)

    if (!token) {
      console.log('Session API - no token, returning null user')
      return NextResponse.json({ user: null })
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as any

    const user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    }
    
    console.log('Session API - returning user:', user)

    return NextResponse.json({
      user: user
    })

  } catch {
    // Invalid token
    const response = NextResponse.json({ user: null })
    
    // Clear invalid cookie with same config as login
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: false, // Always false in development
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      // No domain set - let browser handle it automatically
    })
    
    return response
  }
}