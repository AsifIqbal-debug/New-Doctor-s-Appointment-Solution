"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

interface PatientRecord {
  id: string
  user: {
    name: string
    email: string
    phone?: string
  }
  dob?: string
  gender?: string
  notes?: string
  appointments: {
    id: string
    startsAt: string
    status: string
    feeBdt: number
  }[]
}

export default function DoctorPatientRecordsPage() {
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

  // Fetch patient records
  const { data: patientsData, isLoading, error } = useQuery({
    queryKey: ['doctor-patients'],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/doctor/patients', {
        credentials: 'include',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient records')
      }
      
      return response.json()
    },
    enabled: !loading && !!user && user.role === 'DOCTOR'
  })

  const patients: PatientRecord[] = patientsData?.patients || []

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading patient records...</p>
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
            Patient Records
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and view your patients' medical records
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search patients by name or email..."
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
            <p className="text-red-600">Failed to load patient records. Please try again.</p>
          </div>
        )}

        {filteredPatients.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
              No Patient Records Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm ? `No patients found matching "${searchTerm}"` : 'You don\'t have any patient records yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPatients.map((patient: PatientRecord) => (
              <div
                key={patient.id}
                className="p-6 rounded-lg border shadow-sm"
                style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      <button
                        onClick={() => router.push(`/patient/${patient.id}/history?name=${encodeURIComponent(patient.user.name)}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-2"
                        title="View full medical history"
                      >
                        {patient.user.name}
                        <span className="text-sm">📋</span>
                      </button>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                      📧 {patient.user.email}
                    </p>
                    {patient.user.phone && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                        📞 {patient.user.phone}
                      </p>
                    )}
                    {patient.dob && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                        🎂 {new Date(patient.dob).toLocaleDateString()}
                      </p>
                    )}
                    {patient.gender && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        👤 {patient.gender}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-2">
                      Total Appointments
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {patient.appointments?.length || 0}
                    </div>
                  </div>
                </div>

                {patient.notes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>Notes:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{patient.notes}</p>
                  </div>
                )}

                {/* Recent Appointments */}
                {patient.appointments && patient.appointments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>Recent Appointments:</h4>
                    <div className="space-y-2">
                      {patient.appointments.slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {new Date(appointment.startsAt).toLocaleDateString()} - {appointment.status}
                          </span>
                          <span className="font-medium">৳{appointment.feeBdt}</span>
                        </div>
                      ))}
                      {patient.appointments.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{patient.appointments.length - 3} more appointments
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => router.push(`/patient/${patient.id}/history?name=${encodeURIComponent(patient.user.name)}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Full History
                  </button>
                  <button
                    onClick={() => router.push(`/doctor/prescription/create?patientId=${patient.id}`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Write Prescription
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}