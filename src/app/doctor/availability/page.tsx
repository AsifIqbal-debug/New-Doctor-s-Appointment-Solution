"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Availability {
  id: string
  weekday: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface DayOff {
  id: string
  date: string
  reason?: string
}

const weekdays = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export default function DoctorAvailabilityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedDay, setSelectedDay] = useState<number>(1) // Monday
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [dayOffDate, setDayOffDate] = useState('')
  const [dayOffReason, setDayOffReason] = useState('')

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

  // Fetch doctor availability
  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['doctor-availability'],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/doctor/availability', {
        credentials: 'include',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability')
      }
      
      return response.json()
    },
    enabled: !loading && !!user && user.role === 'DOCTOR'
  })

  // Fetch doctor day-offs
  const { data: dayOffsData, isLoading: dayOffsLoading } = useQuery({
    queryKey: ['doctor-dayoffs'],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/doctor/dayoffs', {
        credentials: 'include',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch day offs')
      }
      
      return response.json()
    },
    enabled: !loading && !!user && user.role === 'DOCTOR'
  })

  // Add/Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availabilityData: { weekday: number; startTime: string; endTime: string }) => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/doctor/availability', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(availabilityData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}: Failed to update availability`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] })
      alert('Availability updated successfully!')
    },
    onError: (error) => {
      console.error('Failed to update availability:', error)
      alert(`Failed to update availability: ${error.message}`)
    }
  })

  // Add day off mutation
  const addDayOffMutation = useMutation({
    mutationFn: async (dayOffData: { date: string; reason?: string }) => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/doctor/dayoffs', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(dayOffData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}: Failed to add day off`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-dayoffs'] })
      setDayOffDate('')
      setDayOffReason('')
      alert('Day off added successfully!')
    },
    onError: (error) => {
      console.error('Failed to add day off:', error)
      alert(`Failed to add day off: ${error.message}`)
    }
  })

  const availabilities: Availability[] = availabilityData?.availabilities || []
  const dayOffs: DayOff[] = dayOffsData?.dayOffs || []

  const handleSubmitAvailability = (e: React.FormEvent) => {
    e.preventDefault()
    updateAvailabilityMutation.mutate({
      weekday: selectedDay,
      startTime,
      endTime
    })
  }

  const handleSubmitDayOff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dayOffDate) {
      alert('Please select a date')
      return
    }
    addDayOffMutation.mutate({
      date: dayOffDate,
      reason: dayOffReason || undefined
    })
  }

  if (loading || availabilityLoading || dayOffsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading availability...</p>
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
            Availability Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Set your weekly availability and manage day-offs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weekly Availability */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Set Weekly Availability
              </h2>
              
              <form onSubmit={handleSubmitAvailability} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                    Day of Week
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {weekdays.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateAvailabilityMutation.isPending}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateAvailabilityMutation.isPending ? 'Updating...' : 'Set Availability'}
                </button>
              </form>
            </div>

            {/* Current Weekly Schedule */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Current Weekly Schedule
              </h3>
              {availabilities.length === 0 ? (
                <p className="text-gray-500">No availability set yet.</p>
              ) : (
                <div className="space-y-2">
                  {weekdays.map((day, index) => {
                    const dayAvailability = availabilities.find(a => a.weekday === index && a.isActive)
                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium">{day}</span>
                        {dayAvailability ? (
                          <span className="text-green-600">
                            {dayAvailability.startTime} - {dayAvailability.endTime}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Day Offs */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Add Day Off
              </h2>
              
              <form onSubmit={handleSubmitDayOff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={dayOffDate}
                    onChange={(e) => setDayOffDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={dayOffReason}
                    onChange={(e) => setDayOffReason(e.target.value)}
                    placeholder="e.g., Vacation, Conference, Emergency"
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addDayOffMutation.isPending}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {addDayOffMutation.isPending ? 'Adding...' : 'Add Day Off'}
                </button>
              </form>
            </div>

            {/* Upcoming Day Offs */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Upcoming Day Offs
              </h3>
              {dayOffs.length === 0 ? (
                <p className="text-gray-500">No day offs scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {dayOffs.slice(0, 5).map((dayOff) => (
                    <div key={dayOff.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="font-medium text-red-800 dark:text-red-200">
                        {new Date(dayOff.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      {dayOff.reason && (
                        <div className="text-sm text-red-600 dark:text-red-300">
                          {dayOff.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}