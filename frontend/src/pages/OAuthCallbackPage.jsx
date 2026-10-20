import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { refreshSession } from '../api/client.js'
import PageLoader from '../components/PageLoader.jsx'
import AuthCard from '../features/auth/AuthCard.jsx'

const PROVIDER_ERRORS = {
  access_denied: 'Вход отменён. Можно попробовать ещё раз или войти по email.',
}
const DEFAULT_ERROR = 'Не получилось войти через соцсеть. Попробуйте ещё раз.'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const providerError = searchParams.get('error')
  const navigate = useNavigate()

  const { data, isError } = useQuery({
    queryKey: ['oauth-callback'],
    queryFn: refreshSession,
    enabled: !providerError,
    retry: false,
    gcTime: 0,
  })

  useEffect(() => {
    if (data) {
      navigate('/', { replace: true })
    }
  }, [data, navigate])

  if (!providerError && !isError) {
    return <PageLoader />
  }

  return (
    <AuthCard
      title="Вход не удался"
      subtitle={PROVIDER_ERRORS[providerError] ?? DEFAULT_ERROR}
      footer={<Link to="/login">Попробовать снова</Link>}
    />
  )
}
