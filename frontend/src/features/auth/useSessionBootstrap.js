import { useEffect } from 'react'
import { getMe } from '../../api/auth.js'
import { refreshAccessToken } from '../../api/client.js'
import { useAuthStore } from '../../store/authStore.js'

async function restoreSession() {
  const { status, hasSession, startLoading, setSession, clearSession } = useAuthStore.getState()
  if (status !== 'idle') {
    return
  }
  if (!hasSession) {
    clearSession()
    return
  }

  startLoading()
  try {
    const accessToken = await refreshAccessToken()
    const user = await getMe()
    setSession(user, accessToken)
  } catch {
    clearSession()
  }
}

export function useSessionBootstrap() {
  useEffect(() => {
    restoreSession()
  }, [])
}
