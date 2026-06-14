import { supabase } from './supabase'
import type { Reply, CreateReplyInput } from '../types'
import { useUserStore } from '../stores/useUserStore'

function getUserId(): string {
  return useUserStore.getState().user?.id || ''
}

export async function fetchRepliesByRegret(regretId: string): Promise<Reply[]> {
  const { data } = await supabase
    .from('replies')
    .select(`
      *,
      profiles(nickname)
    `)
    .eq('regret_id', regretId)
    .order('created_at', { ascending: true })

  if (!data) return []

  return data.map((item: any) => ({
    ...item,
    user_nickname: item.profiles?.nickname,
  }))
}

export async function createReply(input: CreateReplyInput): Promise<Reply | null> {
  const userId = getUserId()
  if (!userId) return null

  const { data } = await supabase
    .from('replies')
    .insert({
      regret_id: input.regret_id,
      user_id: userId,
      content: input.content,
      type: input.type,
    })
    .select()
    .single()

  return data
}

export async function fetchUserReplies(userId: string): Promise<Reply[]> {
  const { data } = await supabase
    .from('replies')
    .select(`
      *,
      regrets!inner(content, is_visible)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  return data || []
}
