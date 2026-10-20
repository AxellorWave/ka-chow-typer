import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { saveRun } from '../../api/runs.js'

const MAX_PENDING_RUNS = 10
const RETRYABLE_STATUSES = [408, 429]

const safeStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      return
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      return
    }
  },
}

export const usePendingRuns = create(
  persist(
    (set) => ({
      runs: [],
      add: (userId, payload) =>
        set(({ runs }) => ({ runs: [...runs, { userId, payload }].slice(-MAX_PENDING_RUNS) })),
      remove: (clientRunId) =>
        set(({ runs }) => ({
          runs: runs.filter((run) => run.payload.client_run_id !== clientRunId),
        })),
    }),
    { name: 'kachow-pending-runs', storage: createJSONStorage(() => safeStorage) },
  ),
)

export const newClientRunId = () =>
  crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const isUnauthorized = (error) => error.response?.status === 401

export const isRetryable = (error) =>
  !error.response ||
  error.response.status >= 500 ||
  RETRYABLE_STATUSES.includes(error.response.status)

export const isRejected = (error) => !isRetryable(error) && !isUnauthorized(error)

const inFlight = new Set()

export async function sendRun(payload) {
  const id = payload.client_run_id
  inFlight.add(id)
  try {
    const data = await saveRun(payload)
    usePendingRuns.getState().remove(id)
    return data
  } catch (error) {
    if (isRejected(error)) {
      usePendingRuns.getState().remove(id)
    }
    throw error
  } finally {
    inFlight.delete(id)
  }
}

export async function flushPendingRuns(userId, onSaved) {
  const owned = usePendingRuns
    .getState()
    .runs.filter((run) => run.userId === null || run.userId === userId)
  for (const { payload } of owned) {
    if (inFlight.has(payload.client_run_id)) continue
    try {
      onSaved(await sendRun(payload))
    } catch (error) {
      if (!isRejected(error)) return
    }
  }
}
