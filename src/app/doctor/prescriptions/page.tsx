"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import PrescriptionHistory from '@/components/PrescriptionHistory'

interface Prescription {
  id: string
  appointmentId: string
  doctorId: string
  patientId: string
  itemsJson: any
  advice?: string
  attachmentUrl?: string
  createdAt?: string
  appointment: {
    id: string
    startsAt: string
    doctor: {
      user: {
        name: string
      }
      specialty: string
    }
    patient: {
      id: string
      user: {
        name: string
      }
    }
  }
}

export default function DoctorPrescriptionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

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

  // Fetch prescriptions
  const { data: prescriptionsData, isLoading, error } = useQuery({
    queryKey: ['doctor-prescriptions'],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/doctor/prescriptions', {
        credentials: 'include',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch prescriptions')
      }
      
      return response.json()
    },
    enabled: !loading && !!user && user.role === 'DOCTOR'
  })

  const prescriptions: Prescription[] = prescriptionsData?.prescriptions || []

  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.appointment.patient.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  if (!user || user.role !== 'DOCTOR') {
    return null
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
            Prescriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and view all prescriptions you've written
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => router.push('/doctor/prescription/create')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ✍️ Write New Prescription
          </button>
          <button
            onClick={() => router.push('/doctor/appointments')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📅 View Appointments
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search prescriptions by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Failed to load prescriptions. Please try again.</p>
          </div>
        )}

        <PrescriptionHistory prescriptions={filteredPrescriptions} userRole="DOCTOR" />
      </div>
    </div>
  )
}