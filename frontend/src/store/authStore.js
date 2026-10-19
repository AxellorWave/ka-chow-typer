import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      status: 'idle',
      hasSession: false,
      startLoading: () => set({ status: 'loading' }),
      setAccessToken: (accessToken) => set({ accessToken, hasSession: true }),
      setSession: (user, accessToken) =>
        set({ user, accessToken, hasSession: true, status: 'ready' }),
      clearSession: () =>
        set({ user: null, accessToken: null, hasSession: false, status: 'ready' }),
    }),
    {
      name: 'kachow-auth',
      partialize: (state) => ({ hasSession: state.hasSession }),
    },
  ),
)
