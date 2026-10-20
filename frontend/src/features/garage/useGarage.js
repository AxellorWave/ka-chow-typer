import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getGarage, saveGarage } from '../../api/garage.js'
import { useAuthStore } from '../../store/authStore.js'

export function useGarage() {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  return useQuery({
    queryKey: ['garage', userId],
    queryFn: getGarage,
    enabled: userId !== null,
  })
}

export function useSaveGarage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveGarage,
    onSuccess: ({ config }) => {
      const { user } = useAuthStore.getState()
      if (user) useAuthStore.setState({ user: { ...user, car_config: config } })
      queryClient.setQueryData(['garage', user?.id ?? null], (garage) =>
        garage ? { ...garage, config } : garage,
      )
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['daily'] })
    },
  })
}
