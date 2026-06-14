import { create } from 'zustand'
import type { Regret } from '../types'

interface ModalState {
  regret: Regret | null
  visible: boolean
  open: (regret: Regret) => void
  close: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  regret: null,
  visible: false,
  open: (regret) => set({ regret, visible: true }),
  close: () => set({ visible: false }),
}))
