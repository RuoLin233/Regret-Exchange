import { create } from 'zustand'
import { fetchVisibleRegrets } from '../services/regrets'
import type { Regret } from '../types'

interface RegretState {
  regrets: Regret[]
  loading: boolean
  refreshing: boolean
  loadRegrets: () => Promise<void>
  refreshRegrets: () => Promise<void>
}

export const useRegretStore = create<RegretState>((set) => ({
  regrets: [],
  loading: false,
  refreshing: false,

  loadRegrets: async () => {
    set({ loading: true })
    const regrets = await fetchVisibleRegrets()
    set({ regrets, loading: false })
  },

  refreshRegrets: async () => {
    set({ refreshing: true })
    const regrets = await fetchVisibleRegrets()
    set({ regrets, refreshing: false })
  },
}))
