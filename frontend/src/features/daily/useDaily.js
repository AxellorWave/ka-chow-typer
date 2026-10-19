import { useQuery } from '@tanstack/react-query'
import { getDaily, getDailyLeaderboard } from '../../api/daily.js'
import { useAuthStore } from '../../store/authStore.js'

const LEADERBOARD_LIMIT = 50

export function useDaily() {
  const status = useAuthStore((state) => state.status)
  const userId = useAuthStore((state) => state.user?.id ?? null)
  return useQuery({
    queryKey: ['daily', userId],
    queryFn: getDaily,
    enabled: status === 'ready',
  })
}

export function useDailyLeaderboard(date) {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  return useQuery({
    queryKey: ['daily', 'leaderboard', date, userId],
    queryFn: () => getDailyLeaderboard({ date, limit: LEADERBOARD_LIMIT }),
    enabled: Boolean(date),
  })
}
