"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function PatientDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Patient dashboard useEffect - loading:', loading, 'user:', user)
    
    if (loading) {
      console.log('Still loading, waiting...')
      return
    }
    
    // Wait a bit more before redirecting to allow for state updates
    const timer = setTimeout(() => {
      if (!user) {
        console.log('No user found after timeout, redirecting to login')
        router.push('/login')
        return
      }

      if (user.role !== 'PATIENT') {
        console.log('User role is not PATIENT:', user.role, 'redirecting to home')
        router.push('/')
        return
      }
      
      console.log('User authenticated as patient:', user)
    }, 200)

    return () => clearTimeout(timer)
  }, [user, loading, router])

  if (loading) {
    console.log('Patient dashboard is loading...')
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'PATIENT') {
    return null
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{color: 'var(--foreground)'}}>Patient Dashboard</h1>
          <p className="text-lg opacity-75 mt-2">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Appointments */}
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>My Appointments</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>View and manage your appointments</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm opacity-75">Upcoming</div>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>Prescriptions</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>View your medical prescriptions</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm opacity-75">Active</div>
            </div>
          </div>

          {/* Test Results */}
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>Test Results</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Access your lab results</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm opacity-75">Recent</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--foreground)'}}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/" className="p-4 rounded-lg text-left transition-colors hover:opacity-80 block" style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>
              <div className="font-semibold">Book Appointment</div>
              <div className="text-sm opacity-90">Find and book with doctors</div>
            </Link>
            
            <button className="p-4 rounded-lg text-left transition-colors hover:opacity-80" style={{backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)'}}>
              <div className="font-semibold">My Health Records</div>
              <div className="text-sm opacity-90">View your medical history</div>
            </button>
            
            <button className="p-4 rounded-lg text-left transition-colors hover:opacity-80" style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>
              <div className="font-semibold">Messages</div>
              <div className="text-sm opacity-90">Chat with your doctors</div>
            </button>
            
            <button className="p-4 rounded-lg text-left transition-colors hover:opacity-80" style={{backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)'}}>
              <div className="font-semibold">Profile Settings</div>
              <div className="text-sm opacity-90">Update your information</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--foreground)'}}>Recent Activity</h2>
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{color: 'var(--card-foreground)'}}>No recent activity</h3>
              <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Your appointment history and medical records will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}