import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { isRetryable, isUnauthorized, sendRun } from './pendingRuns.js'
import { refreshAfterRun } from './refreshAfterRun.js'

const MAX_RETRIES = 2

export function useSaveRun(payload, enabled) {
  const queryClient = useQueryClient()
  const startedRef = useRef(null)

  const mutation = useMutation({
    mutationFn: sendRun,
    retry: (failureCount, error) => failureCount < MAX_RETRIES && isRetryable(error),
    retryDelay: (attempt) => 1000 * 2 ** attempt,
    onSuccess: () => refreshAfterRun(queryClient),
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
    sessionExpired: mutation.isError && isUnauthorized(mutation.error),
    retry: () => mutate(payload),
  }
}
