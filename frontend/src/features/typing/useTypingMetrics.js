import { useEffect, useState } from 'react'
import { useStore } from 'zustand'

export function useTypingMetrics(engine, intervalMs = 250) {
  const startedAt = useStore(engine.store, (state) => state.startedAt)
  const finishedAt = useStore(engine.store, (state) => state.finishedAt)
  const pausedAt = useStore(engine.store, (state) => state.pausedAt)
  const errors = useStore(engine.store, (state) => state.errors)
  const [now, setNow] = useState(() => performance.now())

  useEffect(() => {
    if (startedAt === null || finishedAt !== null || pausedAt !== null) return undefined
    const timer = setInterval(() => setNow(performance.now()), intervalMs)
    return () => clearInterval(timer)
  }, [startedAt, finishedAt, pausedAt, intervalMs])

  return { ...engine.getMetrics(finishedAt ?? pausedAt ?? now), errors }
}
