import { getMe } from '../../api/auth.js'
import { useAuthStore } from '../../store/authStore.js'

const RUN_QUERY_KEYS = ['stats', 'leaderboard', 'achievements', 'tracks', 'daily', 'ghost', 'runs']

export async function refreshAfterRun(queryClient) {
  RUN_QUERY_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
  try {
    const user = await getMe()
    useAuthStore.setState({ user })
  } catch {
    return
  }
}
