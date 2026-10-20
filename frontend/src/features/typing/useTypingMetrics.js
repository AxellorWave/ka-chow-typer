import { useEffect, useState } from 'react'
import { useStore } from 'zustand'

const WARMUP_MS = 1500

export function useTypingMetrics(engine, intervalMs = 250) {
  const startedAt = useStore(engine.store, (state) => state.startedAt)
  const finishedAt = useStore(engine.store, (state) => state.finishedAt)
  const pausedAt = useStore(engine.store, (state) => state.pausedAt)
  const errors = useStore(engine.store, (state) => state.errors)
  const running = startedAt !== null && finishedAt === null && pausedAt === null
  const [snapshot, setSnapshot] = useState(null)

  useEffect(() => {
    if (!running) return undefined
    const update = () => setSnapshot(engine.getMetrics(performance.now()))
    const first = setTimeout(update, 0)
    const timer = setInterval(update, intervalMs)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
      setSnapshot(null)
    }
  }, [engine, running, intervalMs])

  const metrics = running
    ? (snapshot ?? engine.getMetrics(startedAt))
    : engine.getMetrics(finishedAt ?? pausedAt ?? 0)

  if (finishedAt === null && metrics.durationMs < WARMUP_MS) {
    return { ...metrics, cpm: 0, wpm: 0, errors }
  }
  return { ...metrics, errors }
}
