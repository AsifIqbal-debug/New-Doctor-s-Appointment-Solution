"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { downloadInvoice, printInvoice } from '@/lib/pdf'

interface PaymentMethod {
  id: string
  name: string
  icon: string
}

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'card', name: 'Card', icon: '💳' },
  { id: 'bkash', name: 'bKash', icon: '📱' },
  { id: 'nagad', name: 'Nagad', icon: '📲' },
  { id: 'rocket', name: 'Rocket', icon: '🚀' }
]

export default function CollectFeePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const appointmentId = params.id as string
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [amountPaid, setAmountPaid] = useState<string>('')
  const [transactionId, setTransactionId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)

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

  const recordPayment = useMutation({
    mutationFn: async (paymentData: any) => {
      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to record payment')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      
      // Store payment data for invoice generation
      setPaymentData({
        ...data,
        ...variables,
        appointment
      })
      
      setPaymentSuccess(true)
    },
    onError: (error) => {
      console.error('Failed to record payment:', error)
      alert('Failed to record payment. Please try again.')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!selectedPaymentMethod || !amountPaid) {
      alert('Please select payment method and enter amount')
      setIsSubmitting(false)
      return
    }

    const amount = parseFloat(amountPaid)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      setIsSubmitting(false)
      return
    }

    recordPayment.mutate({
      appointmentId,
      amount,
      paymentMethod: selectedPaymentMethod,
      transactionId: transactionId.trim() || null,
      notes: notes.trim() || null,
      status: 'COMPLETED'
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

  // Show success screen
  if (paymentSuccess) {
    const handlePrintInvoice = () => {
      if (!paymentData || !appointment) return
      
      const invoiceData = {
        invoiceNumber: paymentData.payment?.id?.substring(0, 8).toUpperCase() || 'INV-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        patientName: appointment.patient?.user?.name || 'Unknown',
        patientId: appointment.patientId,
        doctorName: appointment.doctor?.user?.name || user?.name || 'Doctor',
        doctorSpecialty: appointment.doctor?.specialty || 'General Practice',
        appointmentDate: new Date(appointment.startsAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointmentTime: new Date(appointment.startsAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        consultationFee: paymentData.amount || appointment.feeBdt,
        totalAmount: paymentData.amount || appointment.feeBdt,
        paymentMethod: paymentData.paymentMethod || selectedPaymentMethod,
        transactionId: paymentData.transactionId || transactionId || undefined,
        clinicName: 'Healthcare Clinic',
        clinicAddress: '123 Medical Street, Dhaka, Bangladesh',
        clinicPhone: '+880-1234-567890',
        clinicEmail: 'info@clinic.local'
      }
      
      printInvoice(invoiceData)
    }
    
    const handleDownloadInvoice = () => {
      if (!paymentData || !appointment) return
      
      const invoiceData = {
        invoiceNumber: paymentData.payment?.id?.substring(0, 8).toUpperCase() || 'INV-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        patientName: appointment.patient?.user?.name || 'Unknown',
        patientId: appointment.patientId,
        doctorName: appointment.doctor?.user?.name || user?.name || 'Doctor',
        doctorSpecialty: appointment.doctor?.specialty || 'General Practice',
        appointmentDate: new Date(appointment.startsAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointmentTime: new Date(appointment.startsAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        consultationFee: paymentData.amount || appointment.feeBdt,
        totalAmount: paymentData.amount || appointment.feeBdt,
        paymentMethod: paymentData.paymentMethod || selectedPaymentMethod,
        transactionId: paymentData.transactionId || transactionId || undefined,
        clinicName: 'Healthcare Clinic',
        clinicAddress: '123 Medical Street, Dhaka, Bangladesh',
        clinicPhone: '+880-1234-567890',
        clinicEmail: 'info@clinic.local'
      }
      
      downloadInvoice(invoiceData)
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <div className="text-center p-8 rounded-lg border max-w-md" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2 text-green-600">Fee Collected Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Payment has been recorded for {appointment?.patient?.user?.name}
          </p>
          
          {/* Invoice Actions */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handlePrintInvoice}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Invoice
            </button>
            
            <button
              onClick={handleDownloadInvoice}
              className="w-full px-6 py-3 border rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Invoice PDF
            </button>
          </div>
          
          <button
            onClick={() => router.push('/doctor/appointments')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Return to Appointments →
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
            Collect Fee
          </h1>
          {appointment && (
            <div className="text-gray-600 dark:text-gray-300">
              <p>Patient: <span className="font-medium">{appointment.patient?.user?.name}</span></p>
              <p>Consultation Fee: <span className="font-medium text-green-600">৳{appointment.feeBdt}</span></p>
              <p>Date: {new Date(appointment.startsAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Selection */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Payment Method *
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: selectedPaymentMethod === method.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--card)',
                      borderColor: selectedPaymentMethod === method.id ? 'rgb(59, 130, 246)' : 'var(--border)'
                    }}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className="text-sm font-medium" style={{color: 'var(--foreground)'}}>{method.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Section */}
            <div className="p-6 rounded-lg border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
                Payment Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                    Amount Paid (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg text-lg font-semibold"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    placeholder={appointment?.feeBdt?.toString() || "0.00"}
                    required
                  />
                  {appointment && (
                    <button
                      type="button"
                      onClick={() => setAmountPaid(appointment.feeBdt.toString())}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Use consultation fee (৳{appointment.feeBdt})
                    </button>
                  )}
                </div>

                {(selectedPaymentMethod === 'bkash' || selectedPaymentMethod === 'nagad' || selectedPaymentMethod === 'rocket' || selectedPaymentMethod === 'card') && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                      placeholder="Enter transaction ID"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    placeholder="Any additional notes about the payment..."
                  />
                </div>
              </div>
            </div>

            {/* Summary Section */}
            {amountPaid && (
              <div className="p-6 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Payment Summary</h3>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">৳{amountPaid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-medium">
                      {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Not selected'}
                    </span>
                  </div>
                  {transactionId && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-medium">{transactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                disabled={isSubmitting || recordPayment.isPending || !selectedPaymentMethod || !amountPaid}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || recordPayment.isPending ? 'Recording Payment...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}