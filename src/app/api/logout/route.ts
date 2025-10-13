import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    
    // Clear the auth token cookie with same config as login
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: false, // Always false in development
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      // No domain set - let browser handle it automatically
    })
    
    return response
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}