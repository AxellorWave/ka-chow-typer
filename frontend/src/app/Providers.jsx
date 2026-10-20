import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore.js'

const MAX_RETRIES = 1

const shouldRetry = (failureCount, error) => {
  const status = error?.response?.status
  return failureCount < MAX_RETRIES && (status === undefined || status >= 500)
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
  },
})

useAuthStore.subscribe((state, previous) => {
  if (previous.user && state.user?.id !== previous.user.id) {
    queryClient.resetQueries()
  }
})

export default function Providers({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
