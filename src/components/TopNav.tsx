"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '@/contexts/AuthContext'

export default function TopNav() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md shadow-sm" style={{backgroundColor: 'var(--background)', borderBottomColor: 'var(--border)', borderBottomWidth: '1px'}}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="font-semibold text-xl" style={{color: 'var(--foreground)'}}>Doctor's Clinic</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
              Home
            </Link>
            
            {/* Role-based navigation */}
            {user?.role === 'PATIENT' && (
              <>
                <Link href="/appointments" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
                  My Appointments
                </Link>
                <Link href="/prescriptions" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
                  Prescriptions
                </Link>
                <Link href="/test-results" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
                  Test Results
                </Link>
              </>
            )}

            {user?.role === 'DOCTOR' && (
              <>
                <Link href="/doctor/dashboard" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
                  Dashboard
                </Link>
                <Link href="/doctor/appointments" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
                  Appointments
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link href="/admin/dashboard" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
                  Dashboard
                </Link>
                <Link href="/admin/doctors" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
                  Doctors
                </Link>
                <Link href="/admin/payments" className="transition-colors opacity-75 hover:opacity-100" style={{color: 'var(--foreground)'}}>
                  Payments
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-gray-500 dark:text-gray-400 capitalize">{user.role?.toLowerCase()}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}