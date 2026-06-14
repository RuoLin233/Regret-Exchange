import { supabase } from './supabase'
import type { Regret, CreateRegretInput, UserStats } from '../types'
import { useUserStore } from '../stores/useUserStore'

function getUserId(): string {
  return useUserStore.getState().user?.id || ''
}

export async function fetchVisibleRegrets(): Promise<Regret[]> {
  const { data } = await supabase
    .from('regrets')
    .select(`
      *,
      profiles(nickname),
      reply_count:replies(count)
    `)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!data) return []

  // 批量获取最新回应预览
  const regretIds = data.filter((r: any) => r.reply_count?.[0]?.count > 0).map((r: any) => r.id)
  const latestReplies: Record<string, { content: string }> = {}
  if (regretIds.length > 0) {
    const { data: replies } = await supabase
      .from('replies')
      .select('regret_id, content')
      .in('regret_id', regretIds)
      .order('created_at', { ascending: false })
    const seen = new Set<string>()
    for (const r of replies || []) {
      if (!seen.has(r.regret_id)) {
        seen.add(r.regret_id)
        latestReplies[r.regret_id] = { content: r.content }
      }
    }
  }

  return data.map((item: any) => ({
    ...item,
    user_nickname: item.is_anonymous ? '匿名' : item.profiles?.nickname,
    reply_count: item.reply_count?.[0]?.count || 0,
    latest_reply: latestReplies[item.id] || null,
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
  const userId = getUserId()
  if (!userId) return null

  const { data } = await supabase
    .from('regrets')
    .insert({
      user_id: userId,
      content: input.content,
      emotion_tag: input.emotion_tag || null,
      regret_color: input.regret_color || 'ocean',
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
