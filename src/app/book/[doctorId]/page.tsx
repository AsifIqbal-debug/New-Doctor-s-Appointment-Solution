"use client"

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSlots } from '@/hooks/useSlots'
import { useBookAppointment } from '@/hooks/useBookAppointment'
import { useAuth } from '@/contexts/AuthContext'

interface BookPageProps {
  params: Promise<{ doctorId: string }>
}

export default function BookPage({ params }: BookPageProps) {
  const { doctorId } = use(params)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  
  const { data: slots, isLoading: slotsLoading, error: slotsError } = useSlots(doctorId, selectedDate) as {
    data: any[] | undefined,
    isLoading: boolean,
    error: any
  }
  const { mutateAsync: bookAppointment, isPending: isBooking } = useBookAppointment()

  const handleBookAppointment = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!selectedDate) {
      alert('Please select a date')
      return
    }

    try {
      await bookAppointment({
        doctorId: doctorId,
        date: selectedDate,
        slotIndex: selectedSlotIndex || 0
      })
      
      alert('Appointment booked successfully!')
      router.push('/appointments')
    } catch (error: any) {
      alert(error.message || 'Failed to book appointment')
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600">Select your preferred date and time slot</p>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Select Date</h2>
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value)
            setSelectedSlotIndex(null) // Reset slot selection when date changes
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Time Slots</h2>
          
          {slotsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : slotsError ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Failed to load available slots</div>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Try again
              </button>
            </div>
          ) : slots && Array.isArray(slots) && slots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((slot: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedSlotIndex(index)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSlotIndex === index
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No available slots for the selected date
            </div>
          )}
        </div>
      )}

      {/* Booking Button */}
      {selectedDate && slots && Array.isArray(slots) && slots.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="space-y-4">
            {selectedSlotIndex !== null && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Appointment Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Date: {new Date(selectedDate).toLocaleDateString()}</div>
                  <div>Time: {slots[selectedSlotIndex]?.startTime}</div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleBookAppointment}
              disabled={isBooking || selectedSlotIndex === null}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isBooking || selectedSlotIndex === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isBooking ? 'Booking...' : selectedSlotIndex === null ? 'Select a time slot' : 'Confirm Booking'}
            </button>
            
            {!user && (
              <p className="text-sm text-gray-600 text-center">
                You need to be logged in to book an appointment.{' '}
                <button 
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}