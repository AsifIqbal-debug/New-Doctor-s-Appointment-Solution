"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestResultsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading test results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
            My Test Results
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View your medical test results and reports
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧪</div>
          <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
            Test Results Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            This feature is currently under development. Soon you'll be able to view your lab results, 
            diagnostic reports, and medical test outcomes here.
          </p>
          <div className="space-x-4">
            <Link
              href="/appointments"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Appointments
            </Link>
            <Link
              href="/prescriptions"
              className="inline-block px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              View Prescriptions
            </Link>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
            <div className="text-3xl mb-3">📊</div>
            <h4 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>Lab Reports</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Blood tests, urine analysis, and other laboratory results
            </p>
          </div>
          
          <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
            <div className="text-3xl mb-3">🔬</div>
            <h4 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>Diagnostic Reports</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              X-rays, MRI scans, CT scans, and other imaging results
            </p>
          </div>
          
          <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
            <div className="text-3xl mb-3">📈</div>
            <h4 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>Trend Analysis</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Track your health metrics and test results over time
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}