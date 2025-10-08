import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'

export function useSlots(doctorId: string, date: string) {
  const enabled = Boolean(doctorId && date)
  
  return useQuery({
    queryKey: ['slots', doctorId, date],
    queryFn: () => apiGet(`/api/doctors/${doctorId}/slots?date=${date}`),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}