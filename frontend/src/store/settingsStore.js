import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyTheme } from '../features/theme/applyTheme.js'

export const useSettingsStore = create(
  persist(
    (set) => ({
      soundEnabled:
        typeof window === 'undefined' || !window.matchMedia('(max-width: 768px)').matches,
      displayMode: 'chars',
      language: 'ru',
      showKeyboard: true,
      showHands: true,
      theme:
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      toggleTheme: () =>
        set((state) => {
          const theme = state.theme === 'dark' ? 'light' : 'dark'
          applyTheme(theme)
          return { theme }
        }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleKeyboard: () => set((state) => ({ showKeyboard: !state.showKeyboard })),
      toggleHands: () => set((state) => ({ showHands: !state.showHands })),
      setDisplayMode: (displayMode) => set({ displayMode }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'kachow-settings' },
  ),
)
