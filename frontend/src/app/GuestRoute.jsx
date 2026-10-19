import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageLoader from '../components/PageLoader.jsx'
import { useAuthStore } from '../store/authStore.js'

export default function GuestRoute() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const from = useLocation().state?.from

  if (status !== 'ready') {
    return <PageLoader />
  }
  if (user) {
    return <Navigate to={from ? `${from.pathname}${from.search}` : '/'} replace />
  }
  return <Outlet />
}
