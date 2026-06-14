import { createClient } from '@supabase/supabase-js'

// Taro 构建时替换的 env 变量，配合回退方案
const supabaseUrl = process.env.TARO_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.TARO_APP_SUPABASE_ANON_KEY || ''

// 回退：如果构建时未替换成功，从 window.__TARO_APP_ENV__ 读取
const finalUrl = supabaseUrl || (typeof window !== 'undefined' && (window as any).__TARO_APP_ENV__?.SUPABASE_URL) || ''
const finalKey = supabaseAnonKey || (typeof window !== 'undefined' && (window as any).__TARO_APP_ENV__?.SUPABASE_ANON_KEY) || ''

if (!finalUrl || !finalKey) {
  console.warn('Supabase credentials not configured. Check .env file.')
}

export const supabase = createClient(finalUrl, finalKey)
