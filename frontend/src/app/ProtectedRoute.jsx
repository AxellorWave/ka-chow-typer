import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageLoader from '../components/PageLoader.jsx'
import { useAuthStore } from '../store/authStore.js'

export default function ProtectedRoute() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (status !== 'ready') {
    return <PageLoader />
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
