"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminPaymentsPage() {
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
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
            Payments Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor transactions, manage billing, and view financial reports
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
            Payment Management Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            This feature is currently under development. Soon you'll be able to manage 
            payments, view transaction history, and generate financial reports.
          </p>
        </div>

        {/* Feature Preview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
            <div className="text-3xl mb-3">💰</div>
            <h4 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>Transaction History</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View all payments, refunds, and transaction details with search and filters
            </p>
          </div>
          
          <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
            <div className="text-3xl mb-3">📈</div>
            <h4 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>Revenue Reports</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Generate financial reports, track revenue trends, and analyze payment data
            </p>
          </div>
          
          <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
            <div className="text-3xl mb-3">⚙️</div>
            <h4 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>Billing Settings</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Configure payment methods, pricing, and billing preferences
            </p>
          </div>
        </div>

        {/* Quick Stats Preview */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6" style={{color: 'var(--foreground)'}}>
            Financial Overview (Preview)
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border text-center" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="text-2xl font-bold text-green-600 mb-1">$12,450</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Revenue</div>
            </div>
            <div className="p-4 rounded-lg border text-center" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="text-2xl font-bold text-blue-600 mb-1">156</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Transactions</div>
            </div>
            <div className="p-4 rounded-lg border text-center" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="text-2xl font-bold text-orange-600 mb-1">$89</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Payment</div>
            </div>
            <div className="p-4 rounded-lg border text-center" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="text-2xl font-bold text-purple-600 mb-1">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}