"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAppointments } from '@/hooks/useAppointments'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface AppointmentForDoctor {
  id: string
  startsAt: string
  endsAt: string
  status: string
  feeBdt: number
  paidAmountBdt: number
  patient: {
    id: string
    user: {
      name: string
    }
  }
  prescription?: {
    id: string
  }
  payments?: {
    id: string
    amountBdt: number
    method: string
    receivedAt: string
  }[]
}

export default function DoctorAppointmentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { data: appointments = [], isLoading, error } = useAppointments()
  const queryClient = useQueryClient()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null)

  // Mutation to update appointment status
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: string }) => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setUpdatingAppointment(null)
    },
    onError: (error) => {
      console.error('Failed to update appointment:', error)
      setUpdatingAppointment(null)
      alert('Failed to update appointment status')
    }
  })

  const handleWritePrescription = (appointmentId: string) => {
    router.push(`/doctor/prescription/create?appointmentId=${appointmentId}`)
  }

  const handleCollectFee = (appointmentId: string) => {
    // Navigate to fee collection page or show payment modal
    router.push(`/doctor/appointments/${appointmentId}/collect-fee`)
  }

  const handleTest = (appointmentId: string) => {
    // Navigate to test ordering page
    router.push(`/doctor/appointments/${appointmentId}/tests`)
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return 'Scheduled'
      case 'COMPLETED':
        return 'Completed'
      case 'CANCELLED':
        return 'Cancelled'
      case 'NO_SHOW':
        return 'No Show'
      default:
        return status
    }
  }

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

  if (!user || user.role !== 'DOCTOR') {
    return null
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

  // Group appointments by date
  const groupAppointmentsByDate = (appointments: AppointmentForDoctor[]) => {
    const grouped: { [key: string]: AppointmentForDoctor[] } = {}
    
    appointments.forEach((apt) => {
      const dateKey = new Date(apt.startsAt).toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(apt)
    })
    
    // Sort appointments within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    })
    
    return grouped
  }

  const groupedAppointments = groupAppointmentsByDate(appointments)
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  
  const today = new Date().toDateString()
  const todayDates = sortedDates.filter(date => date === today)
  const upcomingDates = sortedDates.filter(date => new Date(date).getTime() > new Date(today).getTime())
  const pastDates = sortedDates.filter(date => new Date(date).getTime() < new Date(today).getTime()).reverse()

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your patient appointments and consultations
          </p>
          
          {/* Quick Stats */}
          {appointments.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
                <div className="text-2xl font-bold text-blue-600">{todayDates.reduce((sum, date) => sum + groupedAppointments[date].length, 0)}</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
              <div className="text-center p-4 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
                <div className="text-2xl font-bold text-green-600">{upcomingDates.reduce((sum, date) => sum + groupedAppointments[date].length, 0)}</div>
                <div className="text-sm text-gray-500">Upcoming</div>
              </div>
              <div className="text-center p-4 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
                <div className="text-2xl font-bold text-gray-600">{sortedDates.length}</div>
                <div className="text-sm text-gray-500">Total Days</div>
              </div>
            </div>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🩺</div>
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
              No Appointments Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You don't have any appointments scheduled. Patients will see your availability and book appointments.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Today's Appointments */}
            {todayDates.map(date => (
              <div key={date}>
                <h2 className="text-2xl font-semibold mb-4 flex items-center" style={{color: 'var(--foreground)'}}>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">TODAY</span>
                  {formatDate(date)}
                </h2>
                <div className="grid gap-4">
                  {groupedAppointments[date].map((appointment: AppointmentForDoctor) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </div>
            ))}

            {/* Upcoming Appointments */}
            {upcomingDates.map(date => (
              <div key={date}>
                <h2 className="text-2xl font-semibold mb-4 flex items-center" style={{color: 'var(--foreground)'}}>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">UPCOMING</span>
                  {formatDate(date)}
                </h2>
                <div className="grid gap-4">
                  {groupedAppointments[date].map((appointment: AppointmentForDoctor) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </div>
            ))}

            {/* Past Appointments */}
            {pastDates.map(date => (
              <div key={date}>
                <h2 className="text-2xl font-semibold mb-4 flex items-center" style={{color: 'var(--foreground)'}}>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm mr-3">PAST</span>
                  {formatDate(date)}
                </h2>
                <div className="grid gap-4">
                  {groupedAppointments[date].map((appointment: AppointmentForDoctor) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  function AppointmentCard({ appointment }: { appointment: AppointmentForDoctor }) {
    return (
      <div
        className="p-6 rounded-lg shadow-sm border"
        style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              <button
                onClick={() => router.push(`/patient/${appointment.patient.id}/history?name=${encodeURIComponent(appointment.patient.user.name)}`)}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-2"
                title="View patient history"
              >
                {appointment.patient.user.name}
                <span className="text-sm">📋</span>
              </button>
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium">Time:</span> {formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Duration:</span> {Math.round((new Date(appointment.endsAt).getTime() - new Date(appointment.startsAt).getTime()) / (1000 * 60))} minutes
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
            <div className="text-lg font-semibold mt-1">
              {(appointment.payments && appointment.payments.length > 0) || appointment.paidAmountBdt > 0 ? (
                <span className="text-green-600 flex items-center gap-1 justify-end">
                  ✅ Fee Collected
                </span>
              ) : (
                <span style={{color: 'var(--foreground)'}}>৳{appointment.feeBdt}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t" style={{borderColor: 'var(--border)'}}>
          <div className="text-sm text-gray-500">
            {appointment.prescription ? (
              <span className="text-green-600">✓ Prescription Written</span>
            ) : (
              appointment.status === 'COMPLETED' ? (
                <span className="text-orange-600">⚠ No Prescription</span>
              ) : (
                <span className="text-gray-500">Prescription Pending</span>
              )
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Collect Fee Button */}
            {(appointment.payments && appointment.payments.length > 0) || appointment.paidAmountBdt > 0 ? (
              <button 
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-sm font-medium"
              >
                ✅ Fee Collected
              </button>
            ) : (
              <button 
                onClick={() => handleCollectFee(appointment.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                💰 Collect Fee
              </button>
            )}
            
            {/* Write Prescription Button */}
            {appointment.prescription ? (
              <button 
                onClick={() => router.push('/doctor/prescriptions')}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium border-2 border-green-500"
              >
                ✅ Prescription Written
              </button>
            ) : (
              <button 
                onClick={() => handleWritePrescription(appointment.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                📋 Write Prescription
              </button>
            )}
            
            {/* Test Button */}
            <button 
              onClick={() => handleTest(appointment.id)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              🧪 Test
            </button>
          </div>
        </div>
      </div>
    )
  }
}