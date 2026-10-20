import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeAvatar, updateProfile, uploadAvatar } from '../../api/profile.js'
import { useAuthStore } from '../../store/authStore.js'

function useProfileMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (user) => {
      useAuthStore.setState({ user })
      queryClient.setQueryData(['me'], user)
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['daily'] })
    },
  })
}

export const useUpdateNickname = () => useProfileMutation(updateProfile)

export const useUploadAvatar = () => useProfileMutation(uploadAvatar)

export const useRemoveAvatar = () => useProfileMutation(removeAvatar)
