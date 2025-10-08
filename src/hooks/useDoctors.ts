import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'

export function useDoctors(query: string = '') {
  return useQuery({
    queryKey: ['doctors', query],
    queryFn: () => apiGet(`/api/doctors?q=${encodeURIComponent(query)}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}