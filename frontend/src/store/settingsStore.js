import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      soundEnabled: true,
      displayMode: 'chars',
      language: 'ru',
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setDisplayMode: (displayMode) => set({ displayMode }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'kachow-settings' },
  ),
)
