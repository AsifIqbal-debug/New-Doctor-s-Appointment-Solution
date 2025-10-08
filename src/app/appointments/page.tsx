"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useAppointments } from '@/hooks/useAppointments'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AppointmentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { data: appointments, isLoading, error } = useAppointments()

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
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading appointments...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{color: 'var(--foreground)'}}>
          My Appointments
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700">Error loading appointments: {error.message}</p>
          </div>
        )}

        {appointments && appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v6m4-6v6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{color: 'var(--foreground)'}}>No appointments yet</h3>
            <p className="text-gray-500 mb-4">You haven't booked any appointments.</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Doctors
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments?.map((appointment: any) => (
              <div
                key={appointment.id}
                className="p-6 rounded-lg shadow-sm border"
                style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
                      Dr. {appointment.doctor?.name}
                    </h3>
                    <p className="text-gray-600 mb-1">
                      {appointment.doctor?.specialty}
                    </p>
                    <p className="text-gray-600">
                      {appointment.doctor?.qualification}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {appointment.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                    <p className="font-medium" style={{color: 'var(--foreground)'}}>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600">
                      {appointment.time}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fee</p>
                    <p className="font-medium text-green-600">
                      ৳{appointment.fee}
                    </p>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-700">{appointment.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t" style={{borderColor: 'var(--border)'}}>
                  <div className="text-sm text-gray-500">
                    Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                  </div>
                  
                  {appointment.status === 'PENDING' && (
                    <button
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => {
                        // TODO: Add cancel appointment functionality
                        alert('Cancel appointment functionality coming soon')
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}