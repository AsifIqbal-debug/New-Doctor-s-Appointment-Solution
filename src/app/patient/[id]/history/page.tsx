"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

interface PatientHistoryData {
  patient: {
    id: string
    user: {
      id: string
      name: string
      email: string
      phone: string
    }
    dob: string | null
    gender: string | null
  }
  appointments: Array<{
    id: string
    startsAt: string
    endsAt: string
    status: string
    feeBdt: number
    doctor: {
      user: {
        name: string
      }
    }
    prescription?: {
      id: string
      itemsJson: any
      advice: string | null
    }
  }>
  prescriptions: Array<{
    id: string
    itemsJson: any
    advice: string | null
    appointment: {
      startsAt: string
      doctor: {
        user: {
          name: string
        }
      }
    }
  }>
  testOrders: Array<{
    id: string
    type: string
    notes: string | null
    uploadedResultUrl: string | null
    appointment: {
      startsAt: string
      doctor: {
        user: {
          name: string
        }
      }
    }
  }>
}

export default function PatientHistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const patientId = params.id as string
  const patientName = searchParams.get('name') || 'Patient'
  
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'tests'>('appointments')

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    if (!patientId) {
      router.push('/doctor/appointments')
      return
    }
  }, [user, loading, router, patientId])

  // Fetch patient history
  const { data: historyData, isLoading, error } = useQuery<PatientHistoryData>({
    queryKey: ['patient-history', patientId],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/patients/${patientId}/history`, {
        credentials: 'include',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient history')
      }
      
      return response.json()
    },
    enabled: !loading && !!user && !!patientId
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const parseMedications = (itemsJson: any) => {
    try {
      return JSON.parse(itemsJson)
    } catch {
      return []
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading patient history...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'DOCTOR' && user.role !== 'ADMIN') || !patientId) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Failed to load patient history</div>
          <button
            onClick={() => router.push('/doctor/appointments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold" style={{color: 'var(--foreground)'}}>
                Patient History
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                {historyData?.patient?.user?.name || patientName}
              </p>
            </div>
            <button
              onClick={() => router.push('/doctor/appointments')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}
            >
              ← Back to Appointments
            </button>
          </div>

          {/* Patient Info */}
          {historyData?.patient && (
            <div className="p-4 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium" style={{color: 'var(--foreground)'}}>
                    {historyData.patient.user.email}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium" style={{color: 'var(--foreground)'}}>
                    {historyData.patient.user.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth:</span>
                  <p className="font-medium" style={{color: 'var(--foreground)'}}>
                    {historyData.patient.dob ? formatDate(historyData.patient.dob) : 'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <p className="font-medium" style={{color: 'var(--foreground)'}}>
                    {historyData.patient.gender || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b" style={{borderColor: 'var(--border)'}}>
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'appointments', label: 'Appointments', count: historyData?.appointments?.length || 0 },
                { id: 'prescriptions', label: 'Prescriptions', count: historyData?.prescriptions?.length || 0 },
                { id: 'tests', label: 'Lab Tests', count: historyData?.testOrders?.length || 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              {historyData?.appointments && historyData.appointments.length > 0 ? (
                <div className="space-y-4">
                  {historyData.appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-6 rounded-lg border"
                      style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold" style={{color: 'var(--foreground)'}}>
                            {formatDate(appointment.startsAt)} at {formatTime(appointment.startsAt)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Doctor: {appointment.doctor.user.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Duration: {formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <div className="text-lg font-semibold mt-1 text-green-600">
                            ৳{appointment.feeBdt}
                          </div>
                        </div>
                      </div>
                      
                      {appointment.prescription && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            ✓ Prescription Available
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
                    No Previous Appointments
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    This patient has no appointment history.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div>
              {historyData?.prescriptions && historyData.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {historyData.prescriptions.map((prescription) => {
                    const medications = parseMedications(prescription.itemsJson)
                    return (
                      <div
                        key={prescription.id}
                        className="p-6 rounded-lg border"
                        style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}
                      >
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>
                            Prescription - {formatDate(prescription.appointment.startsAt)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Prescribed by: Dr. {prescription.appointment.doctor.user.name}
                          </p>
                        </div>

                        {/* Medications */}
                        {medications && medications.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>
                              Medications:
                            </h4>
                            <div className="space-y-2">
                              {medications.map((med: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="font-medium" style={{color: 'var(--foreground)'}}>
                                    {med.name} {med.dosage && `- ${med.dosage}`}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {med.frequency && `Frequency: ${med.frequency}`}
                                    {med.duration && ` | Duration: ${med.duration}`}
                                  </div>
                                  {med.instructions && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      Instructions: {med.instructions}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Doctor's Advice */}
                        {prescription.advice && (
                          <div>
                            <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>
                              Doctor's Advice:
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              {prescription.advice}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💊</div>
                  <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
                    No Prescriptions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    This patient has no prescription history.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === 'tests' && (
            <div>
              {historyData?.testOrders && historyData.testOrders.length > 0 ? (
                <div className="space-y-4">
                  {historyData.testOrders.map((testOrder) => (
                    <div
                      key={testOrder.id}
                      className="p-6 rounded-lg border"
                      style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold" style={{color: 'var(--foreground)'}}>
                            {testOrder.type} - {formatDate(testOrder.appointment.startsAt)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Ordered by: Dr. {testOrder.appointment.doctor.user.name}
                          </p>
                        </div>
                        <div>
                          {testOrder.uploadedResultUrl ? (
                            <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                              Results Available
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {testOrder.notes && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>
                            Instructions:
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            {testOrder.notes}
                          </p>
                        </div>
                      )}

                      {testOrder.uploadedResultUrl && (
                        <div>
                          <a
                            href={testOrder.uploadedResultUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            📄 View Results
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🧪</div>
                  <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
                    No Lab Tests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    This patient has no lab test history.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}