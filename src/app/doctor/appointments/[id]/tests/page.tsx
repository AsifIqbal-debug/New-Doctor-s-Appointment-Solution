"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface TestItem {
  id: string
  name: string
  category: string
  price: number
  selected: boolean
}

const availableTests: TestItem[] = [
  { id: '1', name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 500, selected: false },
  { id: '2', name: 'Lipid Profile', category: 'Biochemistry', price: 800, selected: false },
  { id: '3', name: 'Liver Function Test (LFT)', category: 'Biochemistry', price: 1200, selected: false },
  { id: '4', name: 'Kidney Function Test (KFT)', category: 'Biochemistry', price: 1000, selected: false },
  { id: '5', name: 'Thyroid Function Test (TSH, T3, T4)', category: 'Endocrinology', price: 1500, selected: false },
  { id: '6', name: 'Blood Sugar (Random)', category: 'Biochemistry', price: 300, selected: false },
  { id: '7', name: 'HbA1c (Diabetes)', category: 'Biochemistry', price: 600, selected: false },
  { id: '8', name: 'Urine Routine Examination', category: 'Pathology', price: 200, selected: false },
  { id: '9', name: 'Chest X-Ray', category: 'Radiology', price: 800, selected: false },
  { id: '10', name: 'ECG', category: 'Cardiology', price: 500, selected: false },
  { id: '11', name: 'Ultrasound Abdomen', category: 'Radiology', price: 1500, selected: false },
  { id: '12', name: 'Vitamin D', category: 'Biochemistry', price: 1200, selected: false }
]

export default function TestOrderPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const appointmentId = params.id as string
  
  const [selectedTests, setSelectedTests] = useState<TestItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [instructions, setInstructions] = useState('')
  const [urgency, setUrgency] = useState('ROUTINE')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ['All', ...Array.from(new Set(availableTests.map(test => test.category)))]

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
  const { data: appointmentData, isLoading: appointmentLoading } = useQuery({
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

  const appointment = appointmentData?.appointment

  const orderTests = useMutation({
    mutationFn: async (testData: any) => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/test-orders', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(testData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to order tests')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      router.push('/doctor/appointments')
    },
    onError: (error) => {
      console.error('Failed to order tests:', error)
      alert('Failed to order tests. Please try again.')
    }
  })

  const filteredTests = availableTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleTestSelection = (test: TestItem) => {
    const isSelected = selectedTests.find(t => t.id === test.id)
    if (isSelected) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id))
    } else {
      setSelectedTests([...selectedTests, test])
    }
  }

  const getTotalCost = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (selectedTests.length === 0) {
      alert('Please select at least one test')
      setIsSubmitting(false)
      return
    }

    orderTests.mutate({
      appointmentId,
      tests: selectedTests.map(test => ({
        testId: test.id,
        testName: test.name,
        category: test.category,
        price: test.price
      })),
      instructions: instructions.trim() || null,
      urgency,
      totalAmount: getTotalCost()
    })
  }

  if (loading || appointmentLoading) {
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

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
            Order Lab Tests
          </h1>
          {appointment && (
            <div className="text-gray-600 dark:text-gray-300">
              <p>Patient: <span className="font-medium">{appointment.patient?.user?.name}</span></p>
              <p>Date: {new Date(appointment.startsAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Test Selection Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    placeholder="Search tests..."
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Available Tests */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Available Tests
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTests.map((test) => {
                  const isSelected = selectedTests.find(t => t.id === test.id)
                  return (
                    <div
                      key={test.id}
                      onClick={() => toggleTestSelection(test)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : undefined,
                        borderColor: isSelected ? 'rgb(59, 130, 246)' : 'var(--border)'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium" style={{color: 'var(--foreground)'}}>{test.name}</div>
                          <div className="text-sm text-gray-500">{test.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">৳{test.price}</div>
                          {isSelected && (
                            <div className="text-blue-600 text-sm">✓ Selected</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Selected Tests Summary */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h3 className="font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Selected Tests ({selectedTests.length})
              </h3>
              {selectedTests.length > 0 ? (
                <div className="space-y-2">
                  {selectedTests.map((test) => (
                    <div key={test.id} className="flex justify-between items-center py-2 border-b" style={{borderColor: 'var(--border)'}}>
                      <div>
                        <div className="text-sm font-medium" style={{color: 'var(--foreground)'}}>{test.name}</div>
                        <div className="text-xs text-gray-500">{test.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold">৳{test.price}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTestSelection(test)
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t font-semibold" style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}>
                    Total: ৳{getTotalCost()}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No tests selected</p>
              )}
            </div>

            {/* Order Details */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
                <h3 className="font-semibold mb-4" style={{color: 'var(--foreground)'}}>Order Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Urgency Level
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                    >
                      <option value="ROUTINE">Routine (2-3 days)</option>
                      <option value="URGENT">Urgent (Same day)</option>
                      <option value="STAT">STAT (2-4 hours)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Special Instructions
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                      placeholder="Any special instructions for the lab..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/doctor/appointments')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || orderTests.isPending || selectedTests.length === 0}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || orderTests.isPending ? 'Ordering...' : `Order Tests (৳${getTotalCost()})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}