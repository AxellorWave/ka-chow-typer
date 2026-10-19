import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'

export function useRideDaily(date) {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(() => {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    navigate(`/train?daily=${date}`)
  }, [user, navigate, location, date])
}
