import { useEffect } from 'react'
import { isAuthRejected, refreshSession } from '../../api/client.js'
import { useAuthStore } from '../../store/authStore.js'

const RETRY_DELAY_MS = 5000

export async function restoreSession() {
  const { status, hasSession, startLoading, clearSession, setOffline } = useAuthStore.getState()
  if (status !== 'idle' && status !== 'offline') {
    return
  }
  if (!hasSession) {
    clearSession()
    return
  }

  startLoading()
  try {
    await refreshSession()
  } catch (error) {
    if (isAuthRejected(error)) {
      clearSession()
    } else {
      setOffline()
    }
  }
}

export function useSessionBootstrap() {
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    if (status === 'idle') {
      restoreSession()
      return
    }
    if (status !== 'offline') {
      return
    }
    const timer = setTimeout(restoreSession, RETRY_DELAY_MS)
    window.addEventListener('online', restoreSession)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', restoreSession)
    }
  }, [status])
}
