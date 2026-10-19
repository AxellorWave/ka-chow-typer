import { create } from 'zustand'

const TOAST_TTL_MS = 4500

let nextId = 1

export const useToastStore = create((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++
    set({ toasts: [...get().toasts, { ...toast, id }] })
    setTimeout(() => get().dismiss(id), TOAST_TTL_MS)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}))

export function showAchievementToasts(achievements = []) {
  const { push } = useToastStore.getState()
  achievements.forEach((achievement) =>
    push({ icon: achievement.icon, title: achievement.title, text: achievement.description }),
  )
}
