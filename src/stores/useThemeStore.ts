import { create } from 'zustand'

type ThemeMode = 'day' | 'night'

interface ThemeState {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'day',
  toggle: () => set((s) => ({ mode: s.mode === 'day' ? 'night' : 'day' })),
  setMode: (mode) => set({ mode }),
}))
