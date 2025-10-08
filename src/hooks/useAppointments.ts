import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'

export function useAppointments() {
  const { user, loading } = useAuth()
  
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
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
        credentials: 'include',
        headers
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      // Extract the appointments array from the response object
      return data.appointments || []
    },
    enabled: !loading && !!user, // Only run query when user is authenticated
    staleTime: 60 * 1000, // 1 minute
  })
}
