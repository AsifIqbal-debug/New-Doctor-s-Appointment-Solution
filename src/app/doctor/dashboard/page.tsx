"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DoctorDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'DOCTOR') {
      router.push('/')
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'DOCTOR') {
    return null
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{color: 'var(--foreground)'}}>Doctor Dashboard</h1>
          <p className="text-lg opacity-75 mt-2">Welcome, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>Today's Schedule</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Your appointments for today</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm opacity-75">Appointments Today</div>
            </div>
          </div>

          {/* This Week */}
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>This Week</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Weekly appointment summary</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm opacity-75">Total This Week</div>
            </div>
          </div>

          {/* Patient Messages */}
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>Messages</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Patient inquiries and updates</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm opacity-75">Unread Messages</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--foreground)'}}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/doctor/appointments')}
              className="p-4 rounded-lg text-left transition-colors hover:opacity-80" 
              style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
            >
              <div className="font-semibold">View Schedule</div>
              <div className="text-sm opacity-90">Check your appointment schedule</div>
            </button>
            
            <button 
              onClick={() => router.push('/doctor/records')}
              className="p-4 rounded-lg text-left transition-colors hover:opacity-80" 
              style={{backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)'}}
            >
              <div className="font-semibold">Patient Records</div>
              <div className="text-sm opacity-90">Access patient information</div>
            </button>
            
            <button 
              onClick={() => router.push('/doctor/prescriptions')}
              className="p-4 rounded-lg text-left transition-colors hover:opacity-80" 
              style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
            >
              <div className="font-semibold">Prescriptions</div>
              <div className="text-sm opacity-90">Write and manage prescriptions</div>
            </button>
            
            <button 
              onClick={() => router.push('/doctor/availability')}
              className="p-4 rounded-lg text-left transition-colors hover:opacity-80" 
              style={{backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)'}}
            >
              <div className="font-semibold">Availability</div>
              <div className="text-sm opacity-90">Update your availability</div>
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--foreground)'}}>Upcoming Appointments</h2>
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{color: 'var(--card-foreground)'}}>No appointments scheduled</h3>
              <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Your upcoming appointments will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}