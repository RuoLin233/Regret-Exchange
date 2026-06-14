import { create } from 'zustand'
import { supabase } from '../services/supabase'
import type { Profile } from '../types'

// 本地用户邮箱
const LOCAL_EMAIL = 'local@test.com'

const DEFAULT_PROFILE: Profile = {
  id: '',
  nickname: '海风旅人',
  avatar_url: null,
  created_at: new Date().toISOString(),
}

interface UserState {
  user: { id: string; email: string } | null
  profile: Profile | null
  isAuthReady: boolean
  initialize: () => Promise<void>
  refreshProfile: () => Promise<void>
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  isAuthReady: false,

  initialize: async () => {
    try {
      // 从数据库查找本地测试用户
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (users && users.length > 0) {
        const profile = users[0] as Profile
        set({
          user: { id: profile.id, email: LOCAL_EMAIL },
          profile,
          isAuthReady: true,
        })
        return
      }

      // 没有找到用户，用默认值
      set({
        user: { id: '', email: LOCAL_EMAIL },
        profile: DEFAULT_PROFILE,
        isAuthReady: true,
      })
    } catch {
      set({
        user: { id: '', email: LOCAL_EMAIL },
        profile: DEFAULT_PROFILE,
        isAuthReady: true,
      })
    }
  },

  refreshProfile: async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      if (data && data.length > 0) set({ profile: data[0] as Profile })
    } catch {
      // ignore
    }
  },

  logout: () => {
    // 本地模式不执行登出
  },
}))
