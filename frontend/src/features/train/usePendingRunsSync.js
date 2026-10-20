import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '../../store/authStore.js'
import { showAchievementToasts, useToastStore } from '../effects/toastStore.js'
import { formatNumber } from './format.js'
import { flushPendingRuns } from './pendingRuns.js'
import { refreshAfterRun } from './refreshAfterRun.js'

export function usePendingRunsSync() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id ?? null)

  useEffect(() => {
    if (userId === null) return
    flushPendingRuns(userId, (result) => {
      useToastStore.getState().push({
        icon: '🏁',
        caption: 'Заезд сохранён',
        title: `+${formatNumber(result.xp_earned)} XP`,
        text: 'Результат добавлен в профиль',
      })
      showAchievementToasts(result.new_achievements)
      refreshAfterRun(queryClient)
    })
  }, [userId, queryClient])
}
