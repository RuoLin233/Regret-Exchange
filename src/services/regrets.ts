import { supabase } from './supabase'
import type { Regret, CreateRegretInput, UserStats } from '../types'

export async function fetchVisibleRegrets(): Promise<Regret[]> {
  const { data } = await supabase
    .from('regrets')
    .select(`
      *,
      profiles!inner(nickname),
      reply_count:replies(count)
    `)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!data) return []

  return data.map((item: any) => ({
    ...item,
    user_nickname: item.is_anonymous ? '匿名' : item.profiles?.nickname,
    reply_count: item.reply_count?.[0]?.count || 0,
  }))
}

export async function fetchUserRegrets(userId: string): Promise<Regret[]> {
  const { data } = await supabase
    .from('regrets')
    .select(`
      *,
      reply_count:replies(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (!data) return []

  return data.map((item: any) => ({
    ...item,
    user_nickname: '我',
    reply_count: item.reply_count?.[0]?.count || 0,
  }))
}

export async function createRegret(input: CreateRegretInput): Promise<Regret | null> {
  const user = await supabase.auth.getUser()
  if (!user.data.user) return null

  const { data } = await supabase
    .from('regrets')
    .insert({
      user_id: user.data.user.id,
      content: input.content,
      emotion_tag: input.emotion_tag || null,
      is_anonymous: input.is_anonymous,
    })
    .select()
    .single()

  return data
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const [regretsResult, repliesResult] = await Promise.all([
    supabase.from('regrets').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('replies').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  return {
    regrets_count: regretsResult.count || 0,
    replies_count: repliesResult.count || 0,
  }
}
