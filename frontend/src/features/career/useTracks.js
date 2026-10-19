import { useQuery } from '@tanstack/react-query'
import { getTracks } from '../../api/tracks.js'
import { useAuthStore } from '../../store/authStore.js'

export function useTracks({ enabled = true } = {}) {
  const status = useAuthStore((state) => state.status)
  const userId = useAuthStore((state) => state.user?.id ?? null)
  return useQuery({
    queryKey: ['tracks', userId],
    queryFn: getTracks,
    enabled: enabled && status === 'ready',
  })
}
