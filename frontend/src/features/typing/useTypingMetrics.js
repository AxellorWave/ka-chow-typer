import { useEffect, useState } from 'react'
import { useStore } from 'zustand'

export function useTypingMetrics(engine, intervalMs = 250) {
  const startedAt = useStore(engine.store, (state) => state.startedAt)
  const finishedAt = useStore(engine.store, (state) => state.finishedAt)
  const errors = useStore(engine.store, (state) => state.errors)
  const [now, setNow] = useState(() => performance.now())

  useEffect(() => {
    if (startedAt === null || finishedAt !== null) return undefined
    const timer = setInterval(() => setNow(performance.now()), intervalMs)
    return () => clearInterval(timer)
  }, [startedAt, finishedAt, intervalMs])

  return { ...engine.getMetrics(finishedAt ?? now), errors }
}
