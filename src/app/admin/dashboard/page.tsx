"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'ADMIN') {
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

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{color: 'var(--foreground)'}}>Admin Dashboard</h1>
          <p className="text-lg opacity-75 mt-2">Welcome, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Statistics Cards */}
          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>System Overview</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Monitor system health and usage</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <div className="text-sm opacity-75">System Status</div>
            </div>
          </div>

          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>User Management</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Manage doctors, patients, and staff</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-green-600">Users</div>
              <div className="text-sm opacity-75">Total Registered</div>
            </div>
          </div>

          <div className="p-6 rounded-xl shadow-sm" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--card-foreground)'}}>Appointments</h3>
            <p className="opacity-75" style={{color: 'var(--card-foreground)'}}>Track all clinic appointments</p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-purple-600">Today</div>
              <div className="text-sm opacity-75">Scheduled</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--foreground)'}}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/doctors')}
              className="p-4 rounded-lg text-left transition-colors hover:opacity-80" 
              style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>
              <div className="font-semibold">👨‍⚕️ Manage Doctors</div>
              <div className="text-sm opacity-90">Add or edit doctor profiles</div>
            </button>
            
            <button 
              onClick={() => router.push('/admin/board-cards')}
              className="p-4 rounded-lg text-left transition-colors hover:opacity-80" 
              style={{backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)'}}>
              <div className="font-semibold">🎴 Board Cards</div>
              <div className="text-sm opacity-90">Manage home page carousel</div>
            </button>
            
            <button 
              onClick={() => router.push('/admin/payments')}
              className="p-4 rounded-lg text-left transition-colors hover:opacity-80" 
              style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>
              <div className="font-semibold">💳 Payments</div>
              <div className="text-sm opacity-90">Track payment records</div>
            </button>
            
            <button className="p-4 rounded-lg text-left transition-colors hover:opacity-80" style={{backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)'}}>
              <div className="font-semibold">📊 Reports</div>
              <div className="text-sm opacity-90">System analytics</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}