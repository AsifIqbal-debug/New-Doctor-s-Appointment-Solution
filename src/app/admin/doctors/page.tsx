"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ImageUpload from '@/components/ImageUpload'

interface Doctor {
  id: string
  userId: string
  specialty: string | null
  qualification?: string | null
  experienceYears?: number | null
  feeBdt: number
  imageUrl?: string | null
  user: {
    name: string
    email: string
  }
  availabilities?: {
    id: string
    weekday: number
    startTime: string
    endTime: string
  }[]
  dayOffs?: {
    id: string
    date: string
    reason?: string
  }[]
}

export default function AdminDoctorsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showOffDaysModal, setShowOffDaysModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  
  // Form states
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    qualification: '',
    experienceYears: '',
    feeBdt: '',
    imageUrl: ''
  })
  
  const [newSchedule, setNewSchedule] = useState({
    weekday: '1',
    startTime: '09:00',
    endTime: '17:00'
  })
  
  const [newOffDay, setNewOffDay] = useState({
    date: '',
    reason: ''
  })

  const [schedules, setSchedules] = useState<any[]>([])
  const [dayOffs, setDayOffs] = useState<any[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [loadingDayOffs, setLoadingDayOffs] = useState(false)

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

  // Fetch all doctors
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/admin/doctors', {
        credentials: 'include',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }
      
      const data = await response.json()
      return data.doctors || []
    },
    enabled: !loading && !!user && user.role === 'ADMIN'
  })

  // Add doctor mutation
  const addDoctorMutation = useMutation({
    mutationFn: async (doctorData: typeof newDoctor) => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(doctorData)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to add doctor')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
      setShowAddModal(false)
      setNewDoctor({
        name: '',
        email: '',
        password: '',
        specialty: '',
        qualification: '',
        experienceYears: '',
        feeBdt: '',
        imageUrl: ''
      })
      alert('✅ Doctor added successfully!')
    },
    onError: (error: Error) => {
      alert(`Failed to add doctor: ${error.message}`)
    }
  })

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
      })

      if (!response.ok) {
        throw new Error('Failed to delete doctor')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
      alert('✅ Doctor removed successfully!')
    },
    onError: (error: Error) => {
      alert(`Failed to remove doctor: ${error.message}`)
    }
  })

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault()
    addDoctorMutation.mutate(newDoctor)
  }

  const handleDeleteDoctor = (doctor: Doctor) => {
    if (confirm(`Are you sure you want to remove Dr. ${doctor.user.name}?`)) {
      deleteDoctorMutation.mutate(doctor.id)
    }
  }

  const handleManageSchedule = async (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setLoadingSchedules(true)
    setShowScheduleModal(true)
    
    try {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/doctors/${doctor.id}/schedule`, {
        credentials: 'include',
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules || [])
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoadingSchedules(false)
    }
  }

  const handleManageOffDays = async (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setLoadingDayOffs(true)
    setShowOffDaysModal(true)
    
    try {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/doctors/${doctor.id}/dayoffs`, {
        credentials: 'include',
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setDayOffs(data.dayOffs || [])
      }
    } catch (error) {
      console.error('Error fetching day offs:', error)
    } finally {
      setLoadingDayOffs(false)
    }
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor) return

    try {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/doctors/${selectedDoctor.id}/schedule`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(newSchedule)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add schedule')
      }

      // Refresh schedules
      await handleManageSchedule(selectedDoctor)
      
      // Reset form
      setNewSchedule({
        weekday: '1',
        startTime: '09:00',
        endTime: '17:00'
      })
      
      alert('✅ Schedule added successfully!')
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
    } catch (error: any) {
      alert(`Failed to add schedule: ${error.message}`)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!selectedDoctor || !confirm('Are you sure you want to delete this schedule?')) return

    try {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/doctors/${selectedDoctor.id}/schedule/${scheduleId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
      })

      if (!response.ok) {
        throw new Error('Failed to delete schedule')
      }

      // Refresh schedules
      await handleManageSchedule(selectedDoctor)
      alert('✅ Schedule deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
    } catch (error: any) {
      alert(`Failed to delete schedule: ${error.message}`)
    }
  }

  const handleAddOffDay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor) return

    try {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/doctors/${selectedDoctor.id}/dayoffs`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(newOffDay)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add day off')
      }

      // Refresh day offs
      await handleManageOffDays(selectedDoctor)
      
      // Reset form
      setNewOffDay({
        date: '',
        reason: ''
      })
      
      alert('✅ Day off added successfully!')
    } catch (error: any) {
      alert(`Failed to add day off: ${error.message}`)
    }
  }

  const handleDeleteOffDay = async (dayoffId: string) => {
    if (!selectedDoctor || !confirm('Are you sure you want to delete this day off?')) return

    try {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/doctors/${selectedDoctor.id}/dayoffs/${dayoffId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
      })

      if (!response.ok) {
        throw new Error('Failed to delete day off')
      }

      // Refresh day offs
      await handleManageOffDays(selectedDoctor)
      alert('✅ Day off deleted successfully!')
    } catch (error: any) {
      alert(`Failed to delete day off: ${error.message}`)
    }
  }

  const getDayName = (weekday: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[weekday] || 'Unknown'
  }

  if (loading || doctorsLoading) {
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
              Doctors Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage doctor profiles, schedules, and availability
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)'
            }}
          >
            ➕ Add New Doctor
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid'}}>
            <div className="text-3xl mb-2">👨‍⚕️</div>
            <div className="text-3xl font-bold mb-1" style={{color: 'var(--accent)'}}>
              {doctors.length}
            </div>
            <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
              Total Doctors
            </div>
          </div>
          
          <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid'}}>
            <div className="text-3xl mb-2">🏥</div>
            <div className="text-3xl font-bold mb-1" style={{color: 'var(--accent)'}}>
              {new Set(doctors.map((d: Doctor) => d.specialty)).size}
            </div>
            <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
              Specialties
            </div>
          </div>
          
          <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid'}}>
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold mb-1" style={{color: 'var(--accent)'}}>
              {doctors.reduce((sum: number, d: Doctor) => sum + (d.availabilities?.length || 0), 0)}
            </div>
            <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
              Active Schedules
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          {doctors.map((doctor: Doctor) => (
            <div
              key={doctor.id}
              className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow" 
              style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid'}}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left Section - Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {doctor.imageUrl ? (
                      <img
                        src={doctor.imageUrl}
                        alt={doctor.user.name}
                        className="w-12 h-12 rounded-full object-cover border-2"
                        style={{borderColor: 'var(--accent)'}}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                           style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}>
                        👨‍⚕️
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold" style={{color: 'var(--foreground)'}}>
                        Dr. {doctor.user.name}
                      </h3>
                      <p className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">📧</span>
                      <div>
                        <p className="text-xs" style={{color: 'var(--foreground-secondary)'}}>Email</p>
                        <p className="font-medium" style={{color: 'var(--foreground)'}}>{doctor.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">🎓</span>
                      <div>
                        <p className="text-xs" style={{color: 'var(--foreground-secondary)'}}>Qualification</p>
                        <p className="font-medium" style={{color: 'var(--foreground)'}}>{doctor.qualification || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">⏱️</span>
                      <div>
                        <p className="text-xs" style={{color: 'var(--foreground-secondary)'}}>Experience</p>
                        <p className="font-medium" style={{color: 'var(--foreground)'}}>{doctor.experienceYears || 0} years</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">💰</span>
                      <div>
                        <p className="text-xs" style={{color: 'var(--foreground-secondary)'}}>Fee</p>
                        <p className="font-medium" style={{color: 'var(--foreground)'}}>৳{doctor.feeBdt}</p>
                      </div>
                    </div>
                  </div>

                  {doctor.availabilities && doctor.availabilities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                        📅 Working Schedule:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {doctor.availabilities.slice(0, 7).map((schedule: any) => (
                          <span
                            key={schedule.id}
                            className="px-2.5 py-1 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: 'var(--accent-foreground)',
                              opacity: 0.9
                            }}
                          >
                            {getDayName(schedule.weekday).substring(0, 3)}: {schedule.startTime.substring(0, 5)}-{schedule.endTime.substring(0, 5)}
                          </span>
                        ))}
                        {doctor.availabilities.length > 7 && (
                          <span
                            className="px-2.5 py-1 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: 'var(--accent-foreground)',
                              opacity: 0.7
                            }}
                          >
                            +{doctor.availabilities.length - 7} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Section - Actions */}
                <div className="flex lg:flex-col gap-2 justify-end">
                  <button
                    onClick={() => handleManageSchedule(doctor)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md whitespace-nowrap"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-foreground)'
                    }}
                  >
                    📅 Schedule
                  </button>
                  <button
                    onClick={() => handleManageOffDays(doctor)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md whitespace-nowrap border"
                    style={{
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    🏖️ Off Days
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all hover:shadow-md whitespace-nowrap"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {doctors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
                No Doctors Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Click "Add New Doctor" to get started
              </p>
            </div>
          )}
        </div>

        {/* Add Doctor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddModal(false)}>
            <div className="max-w-2xl w-full rounded-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" 
                 style={{backgroundColor: 'var(--card)'}}
                 onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{color: 'var(--foreground)'}}>
                  Add New Doctor
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-2xl hover:opacity-70 transition-opacity"
                  style={{color: 'var(--foreground-secondary)'}}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddDoctor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                      placeholder="doctor@clinic.local"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newDoctor.password}
                      onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Specialty *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                      placeholder="Cardiology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={newDoctor.qualification}
                      onChange={(e) => setNewDoctor({...newDoctor, qualification: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                      placeholder="MBBS, MD"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newDoctor.experienceYears}
                      onChange={(e) => setNewDoctor({...newDoctor, experienceYears: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Consultation Fee (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newDoctor.feeBdt}
                      onChange={(e) => setNewDoctor({...newDoctor, feeBdt: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                      placeholder="500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Doctor Profile Picture"
                      value={newDoctor.imageUrl}
                      onChange={(url) => setNewDoctor({...newDoctor, imageUrl: url})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{borderColor: 'var(--border)'}}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2.5 rounded-lg transition-all hover:opacity-80 border"
                    style={{
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addDoctorMutation.isPending}
                    className="px-6 py-2.5 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-foreground)'
                    }}
                  >
                    {addDoctorMutation.isPending ? '⏳ Adding...' : '✅ Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowScheduleModal(false)}>
            <div className="max-w-4xl w-full rounded-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" 
                 style={{backgroundColor: 'var(--card)'}}
                 onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{color: 'var(--foreground)'}}>
                  📅 Manage Schedule - Dr. {selectedDoctor.user.name}
                </h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-2xl hover:opacity-70 transition-opacity"
                  style={{color: 'var(--foreground-secondary)'}}
                >
                  ×
                </button>
              </div>
              
              {/* Add Schedule Form */}
              <div className="mb-6 p-4 rounded-lg border" style={{borderColor: 'var(--border)', backgroundColor: 'var(--background)'}}>
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                  Add New Schedule
                </h3>
                <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Day of Week *
                    </label>
                    <select
                      required
                      value={newSchedule.weekday}
                      onChange={(e) => setNewSchedule({...newSchedule, weekday: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                    >
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      End Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 rounded-lg transition-all hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-foreground)'
                      }}
                    >
                      ➕ Add Schedule
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Schedules */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                  Current Schedules ({schedules.length})
                </h3>
                
                {loadingSchedules ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--accent)'}}></div>
                    <p className="mt-2 text-sm" style={{color: 'var(--foreground-secondary)'}}>Loading schedules...</p>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p style={{color: 'var(--foreground-secondary)'}}>No schedules added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schedules.map((schedule: any) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{borderColor: 'var(--border)', backgroundColor: 'var(--background)'}}
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}>
                            {getDayName(schedule.weekday)}
                          </span>
                          <span style={{color: 'var(--foreground)'}}>
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          {!schedule.isActive && (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-500 text-white">
                              Inactive
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t" style={{borderColor: 'var(--border)'}}>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-6 py-2.5 rounded-lg transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-foreground)'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Off Days Modal */}
        {showOffDaysModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowOffDaysModal(false)}>
            <div className="max-w-3xl w-full rounded-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" 
                 style={{backgroundColor: 'var(--card)'}}
                 onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{color: 'var(--foreground)'}}>
                  🏖️ Manage Off Days - Dr. {selectedDoctor.user.name}
                </h2>
                <button
                  onClick={() => setShowOffDaysModal(false)}
                  className="text-2xl hover:opacity-70 transition-opacity"
                  style={{color: 'var(--foreground-secondary)'}}
                >
                  ×
                </button>
              </div>
              
              {/* Add Off Day Form */}
              <div className="mb-6 p-4 rounded-lg border" style={{borderColor: 'var(--border)', backgroundColor: 'var(--background)'}}>
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                  Add New Off Day
                </h3>
                <form onSubmit={handleAddOffDay} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newOffDay.date}
                      onChange={(e) => setNewOffDay({...newOffDay, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={newOffDay.reason}
                      onChange={(e) => setNewOffDay({...newOffDay, reason: e.target.value})}
                      placeholder="e.g., Vacation, Holiday"
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        border: '1px solid',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 rounded-lg transition-all hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-foreground)'
                      }}
                    >
                      ➕ Add Off Day
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Off Days */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                  Upcoming Off Days ({dayOffs.length})
                </h3>
                
                {loadingDayOffs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--accent)'}}></div>
                    <p className="mt-2 text-sm" style={{color: 'var(--foreground-secondary)'}}>Loading off days...</p>
                  </div>
                ) : dayOffs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🏖️</div>
                    <p style={{color: 'var(--foreground-secondary)'}}>No off days scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayOffs.map((dayOff: any) => (
                      <div
                        key={dayOff.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{borderColor: 'var(--border)', backgroundColor: 'var(--background)'}}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📅</span>
                          <div>
                            <p className="font-medium" style={{color: 'var(--foreground)'}}>
                              {new Date(dayOff.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            {dayOff.reason && (
                              <p className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
                                {dayOff.reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteOffDay(dayOff.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t" style={{borderColor: 'var(--border)'}}>
                <button
                  onClick={() => setShowOffDaysModal(false)}
                  className="px-6 py-2.5 rounded-lg transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-foreground)'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}