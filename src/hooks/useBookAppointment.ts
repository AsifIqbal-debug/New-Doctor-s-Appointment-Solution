import { useMutation, useQueryClient } from '@tanstack/react-query'

interface BookAppointmentData {
  doctorId: string
  date: string
  slotIndex?: number
}

export function useBookAppointment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: BookAppointmentData) => {
      // Get token from localStorage as backup
      const token = localStorage.getItem('auth-token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // Include Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch appointment-related queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}