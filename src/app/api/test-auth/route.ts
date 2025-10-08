import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test login flow
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'patient@clinic.local',
        password: 'patient123'
      }),
    })

    const loginData = await loginResponse.json()
    console.log('Test login response:', loginData)

    if (!loginData.success) {
      return NextResponse.json({
        error: 'Login failed',
        details: loginData
      })
    }

    // Try to get session with the cookie
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('Cookies from login:', cookies)

    const sessionResponse = await fetch('http://localhost:3000/api/session', {
      headers: {
        'Cookie': cookies || ''
      }
    })

    const sessionData = await sessionResponse.json()
    console.log('Session response:', sessionData)

    return NextResponse.json({
      success: true,
      login: loginData,
      session: sessionData,
      cookies: cookies
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}