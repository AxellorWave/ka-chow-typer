import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getGhost } from '../../api/ghost.js'
import { useAuthStore } from '../../store/authStore.js'
import { elapsedMs, progressAt } from './timeline.js'

const TICK_MS = 100

function ghostTarget(run) {
  if (run?.track_id) return { trackId: run.track_id }
  if (run?.text_id) return { textId: run.text_id }
  return null
}

export function useGhost(run, who) {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const target = ghostTarget(run)
  const enabled = userId !== null && who !== 'off' && target !== null
  const { data } = useQuery({
    queryKey: ['ghost', who, target, userId],
    queryFn: () => getGhost({ ...target, who }),
    enabled,
    retry: false,
  })
  return enabled ? (data ?? null) : null
}

export function useGhostProgress(engine, ghost) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!ghost) return undefined
    const tick = () =>
      setProgress(progressAt(ghost.timeline, elapsedMs(engine.store.getState(), performance.now())))
    tick()
    const timer = setInterval(tick, TICK_MS)
    return () => clearInterval(timer)
  }, [engine, ghost])

  return ghost ? progress : 0
}
