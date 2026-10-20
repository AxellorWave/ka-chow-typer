import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changePassword, removeAvatar, updateProfile, uploadAvatar } from '../../api/profile.js'
import { useAuthStore } from '../../store/authStore.js'

function useProfileMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (user) => {
      useAuthStore.setState({ user })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['daily'] })
    },
  })
}

export const useUpdateNickname = () => useProfileMutation(updateProfile)

export const useUploadAvatar = () => useProfileMutation(uploadAvatar)

export const useRemoveAvatar = () => useProfileMutation(removeAvatar)

export function useChangePassword() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: changePassword,
    onSuccess: ({ user, access_token }) => setSession(user, access_token),
  })
}
