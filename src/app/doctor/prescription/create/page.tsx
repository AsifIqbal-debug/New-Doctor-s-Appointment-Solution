"use client"

import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FrequencyInput from '@/components/FrequencyInput'
import MedicineAutocomplete from '@/components/MedicineAutocomplete'

interface Medicine {
  id: string
  name: string
  genericName: string
  strength: string
  form: string
  manufacturer: string
  price: number | null
}

interface MedicationItem {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  // Optional fields from autocomplete
  genericName?: string
  form?: string
  manufacturer?: string
}

function CreatePrescriptionForm() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const appointmentId = searchParams.get('appointmentId')
  
  const [medications, setMedications] = useState<MedicationItem[]>([
    { 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '',
      genericName: '',
      form: '',
      manufacturer: ''
    }
  ])
  const [advice, setAdvice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    if (!appointmentId) {
      router.push('/doctor/appointments')
      return
    }
  }, [user, loading, router, appointmentId])

  // Fetch appointment details
  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        credentials: 'include',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointment')
      }
      
      return response.json()
    },
    enabled: !loading && !!user && !!appointmentId
  })

  // Check if prescription already exists for this appointment
  const { data: existingPrescription, isLoading: prescriptionCheckLoading } = useQuery({
    queryKey: ['prescription-check', appointmentId],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/prescriptions', {
        credentials: 'include',
        headers
      })
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      // Find prescription for this specific appointment
      return data.prescriptions?.find((p: any) => p.appointmentId === appointmentId) || null
    },
    enabled: !loading && !!user && !!appointmentId
  })

  const createPrescription = useMutation({
    mutationFn: async (prescriptionData: any) => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(prescriptionData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create prescription')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['prescription-check'] })
      alert('✅ Prescription created successfully!')
      router.push('/doctor/appointments')
    },
    onError: (error: Error) => {
      console.error('Failed to create prescription:', error)
      
      // Check if it's a duplicate prescription error
      if (error.message.includes('already exists')) {
        alert('⚠️ A prescription already exists for this appointment.\n\nPlease go back to appointments to view it.')
        setTimeout(() => router.push('/doctor/appointments'), 2000)
      } else {
        alert(`Failed to create prescription: ${error.message}\n\nPlease try again.`)
      }
      setIsSubmitting(false)
    }
  })

  const addMedication = () => {
    setMedications([...medications, { 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '',
      genericName: '',
      form: '',
      manufacturer: ''
    }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof MedicationItem, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    )
    setMedications(updated)
    console.log(`✏️ Updated medication ${index}, field: ${field}, value:`, value)
    console.log('📋 All medications:', updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const validMedications = medications.filter(med => med.name.trim() !== '')
    
    if (validMedications.length === 0) {
      alert('Please add at least one medication')
      setIsSubmitting(false)
      return
    }

    createPrescription.mutate({
      appointmentId,
      medications: validMedications,
      advice: advice.trim()
    })
  }

  if (loading || appointmentLoading || prescriptionCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--foreground)'}}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'DOCTOR' || !appointmentId) {
    return null
  }

  // If prescription already exists, show a message instead of the form
  if (existingPrescription) {
    return (
      <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-lg border-2 border-yellow-400 text-center" style={{backgroundColor: 'var(--card)'}}>
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
                Prescription Already Exists
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                A prescription has already been created for this appointment.
              </p>
              {appointment && (
                <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: 'var(--background)'}}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Appointment Details:</p>
                  <p className="font-medium" style={{color: 'var(--foreground)'}}>
                    Patient: {appointment.appointment?.patient?.user?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Date: {new Date(appointment.appointment?.startsAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/doctor/prescriptions')}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  View All Prescriptions
                </button>
                <button
                  onClick={() => router.push('/doctor/appointments')}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}
                >
                  Back to Appointments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
            Write Prescription
          </h1>
          {appointment && (
            <p className="text-gray-600 dark:text-gray-300">
              Patient: {appointment.appointment?.patient?.user?.name} • 
              Date: {new Date(appointment.appointment?.startsAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medications Section */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold" style={{color: 'var(--foreground)'}}>
                  Medications
                </h2>
                <button
                  type="button"
                  onClick={addMedication}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={index} className="p-4 border rounded-lg" style={{borderColor: 'var(--border)'}}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium" style={{color: 'var(--foreground)'}}>
                        Medication {index + 1}
                      </h3>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                          Search Medicine *
                        </label>
                        <MedicineAutocomplete
                          onSelect={(medicine: Medicine) => {
                            console.log('💊 Medicine selected:', medicine)
                            console.log('📝 Updating medication at index:', index)
                            updateMedication(index, 'name', `${medicine.name} ${medicine.strength}`)
                            updateMedication(index, 'dosage', medicine.strength)
                            updateMedication(index, 'genericName', medicine.genericName)
                            updateMedication(index, 'form', medicine.form)
                            updateMedication(index, 'manufacturer', medicine.manufacturer)
                          }}
                        />
                      </div>
                      
                      {medication.name && (
                        <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-semibold text-teal-900 dark:text-teal-100">
                                {medication.name}
                              </p>
                              {medication.genericName && (
                                <p className="text-sm text-teal-700 dark:text-teal-300">
                                  Generic: {medication.genericName}
                                </p>
                              )}
                              {medication.form && (
                                <p className="text-xs text-teal-600 dark:text-teal-400">
                                  Form: {medication.form}
                                  {medication.manufacturer && ` • ${medication.manufacturer}`}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateMedication(index, 'name', '')
                                updateMedication(index, 'dosage', '')
                                updateMedication(index, 'genericName', '')
                                updateMedication(index, 'form', '')
                                updateMedication(index, 'manufacturer', '')
                              }}
                              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm underline"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--foreground)'}}>
                          Frequency *
                        </label>
                        <FrequencyInput
                          value={medication.frequency}
                          onChange={(value) => updateMedication(index, 'frequency', value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--foreground)'}}>
                          Duration
                        </label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                          placeholder="e.g., 7 days"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--foreground)'}}>
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                          placeholder="e.g., Take with food"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice Section */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Doctor's Advice
              </h2>
              <textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)'
                }}
                placeholder="Enter general advice, lifestyle recommendations, follow-up instructions..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/doctor/appointments')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || createPrescription.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || createPrescription.isPending ? 'Creating Prescription...' : 'Create Prescription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CreatePrescriptionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CreatePrescriptionForm />
    </Suspense>
  )
}