import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export async function getAuthUser(request: NextRequest) {
  try {
    console.log('getAuthUser - all cookies:', request.cookies.getAll().map(c => c.name).join(', '))
    
    // Try to get token from cookies first
    let token = request.cookies.get('auth-token')?.value
    
    // If no cookie token, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
        console.log('✅ Auth token found in Authorization header, length:', token.length)
      }
    } else {
      console.log('✅ Auth token found in cookies, length:', token.length)
    }
    
    if (!token) {
      console.log('❌ No auth token found in cookies or Authorization header')
      console.log('Available cookies:', request.cookies.getAll().map(c => c.name))
      return null
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as any

    console.log('getAuthUser - token decoded successfully:', decoded.email)

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    }
  } catch (error) {
    console.log('getAuthUser - error:', error)
    return null
  }
}