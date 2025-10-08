"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User | null>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  console.log('AuthProvider render - user:', user, 'loading:', loading)

  const checkAuth = async () => {
    try {
      console.log('Checking auth...')
      const response = await fetch('/api/session', {
        credentials: 'include'
      })
      console.log('Session API status:', response.status)
      const data = await response.json()
      console.log('Auth response:', data)
      setUser(data.user)
      console.log('User set to:', data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      console.log('Attempting login for:', email)
      
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Login response:', data)

      if (data.success && data.user && data.token) {
        console.log('Login successful, setting user:', data.user)
        console.log('Token received, length:', data.token.length)
        
        // Store token in localStorage as backup for API calls
        localStorage.setItem('auth-token', data.token)
        
        setUser(data.user)
        setLoading(false)
        return data.user
      } else {
        console.log('Login failed:', data.error || data.message || 'Unknown error')
        return null
      }
    } catch (error) {
      console.error('Login failed with error:', error)
      throw error // Re-throw so the UI can handle it
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      localStorage.removeItem('auth-token')
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      localStorage.removeItem('auth-token') // Clear even if API call fails
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}