import { create } from 'zustand'
import { supabase } from '../services/supabase'
import { getProfile, signOut } from '../services/auth'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface UserState {
  user: User | null
  profile: Profile | null
  isAuthReady: boolean
  initialize: () => Promise<void>
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  isAuthReady: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user, isAuthReady: true })
      const profile = await getProfile(session.user.id)
      if (profile) set({ profile })
    } else {
      set({ isAuthReady: true })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user })
        const profile = await getProfile(session.user.id)
        if (profile) set({ profile })
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user) return
    const profile = await getProfile(user.id)
    if (profile) set({ profile })
  },

  logout: async () => {
    await signOut()
    set({ user: null, profile: null })
  },

  setUser: (user) => set({ user }),
}))
