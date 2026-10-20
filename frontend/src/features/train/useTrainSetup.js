import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTrainSetup = create(
  persist(
    (set) => ({
      mode: 'words',
      lang: 'ru',
      difficulty: 1,
      ghost: 'top',
      update: (patch) => set(patch),
    }),
    {
      name: 'kachow-train-setup',
      partialize: ({ mode, lang, difficulty, ghost }) => ({ mode, lang, difficulty, ghost }),
    },
  ),
)
