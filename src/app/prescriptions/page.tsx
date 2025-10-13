"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePrescriptions } from '@/hooks/usePrescriptions'
import { useRouter } from 'next/navigation'
import PrescriptionHistory from '@/components/PrescriptionHistory'

export default function PrescriptionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { data: prescriptions = [], isLoading, error } = usePrescriptions()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading prescriptions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
            My Prescriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View your medical prescription history and medications
          </p>
        </div>

        <PrescriptionHistory prescriptions={prescriptions} userRole="PATIENT" />
      </div>
    </div>
  )
}