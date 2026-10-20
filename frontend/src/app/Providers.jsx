import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore.js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
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
