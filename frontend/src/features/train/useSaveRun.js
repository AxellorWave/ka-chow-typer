import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { getMe } from '../../api/auth.js'
import { saveRun } from '../../api/runs.js'
import { useAuthStore } from '../../store/authStore.js'

const MAX_RETRIES = 2

const isRetryable = (error) => !error.response || error.response.status >= 500

export function useSaveRun(payload, enabled) {
  const queryClient = useQueryClient()
  const startedRef = useRef(null)

  const mutation = useMutation({
    mutationFn: saveRun,
    retry: (failureCount, error) => failureCount < MAX_RETRIES && isRetryable(error),
    retryDelay: (attempt) => 1000 * 2 ** attempt,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      try {
        const user = await getMe()
        useAuthStore.setState({ user })
      } catch {
        return
      }
    },
  })

  const { mutate } = mutation

  useEffect(() => {
    if (!enabled || startedRef.current === payload) return
    startedRef.current = payload
    mutate(payload)
  }, [enabled, payload, mutate])

  return {
    ...mutation,
    retryable: mutation.isError && isRetryable(mutation.error),
    retry: () => mutate(payload),
  }
}
