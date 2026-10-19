import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      soundEnabled: typeof window === 'undefined' || !window.matchMedia('(max-width: 768px)').matches,
      displayMode: 'chars',
      language: 'ru',
      showKeyboard: true,
      showHands: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleKeyboard: () => set((state) => ({ showKeyboard: !state.showKeyboard })),
      toggleHands: () => set((state) => ({ showHands: !state.showHands })),
      setDisplayMode: (displayMode) => set({ displayMode }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'kachow-settings' },
  ),
)
