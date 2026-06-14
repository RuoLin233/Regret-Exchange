import type { AIProvider, AIGenerateInput } from '../types'

const API_CONFIGS: Record<AIProvider, {
  url: string
  headers: (key: string) => Record<string, string>
  body: (content: string) => any
  extract: (data: any) => string
}> = {
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    }),
    body: (content) => ({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `请以温暖治愈的风格，用一句诗意的话回应以下遗憾，不超过50字：\n「${content}」`,
      }],
    }),
    extract: (data) => data.content?.[0]?.text || '',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
    body: (content) => ({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `请以温暖治愈的风格，用一句诗意的话回应以下遗憾，不超过50字：\n「${content}」`,
      }],
    }),
    extract: (data) => data.choices?.[0]?.message?.content || '',
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
    body: (content) => ({
      model: 'deepseek-chat',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `请以温暖治愈的风格，用一句诗意的话回应以下遗憾，不超过50字：\n「${content}」`,
      }],
    }),
    extract: (data) => data.choices?.[0]?.message?.content || '',
  },
  qwen: {
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
    body: (content) => ({
      model: 'qwen-plus',
      input: {
        messages: [{
          role: 'user',
          content: `请以温暖治愈的风格，用一句诗意的话回应以下遗憾，不超过50字：\n「${content}」`,
        }],
      },
      parameters: { max_tokens: 200 },
    }),
    extract: (data) => data.output?.text || '',
  },
}

export async function generateAIResponse(input: AIGenerateInput): Promise<string | null> {
  const config = API_CONFIGS[input.provider]
  if (!config) return null

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: config.headers(input.apiKey),
      body: JSON.stringify(config.body(input.regretContent)),
    })

    if (!response.ok) {
      console.error('AI API error:', response.status)
      return null
    }

    const data = await response.json()
    return config.extract(data) || '✨ 光在途中...'
  } catch (err) {
    console.error('AI call failed:', err)
    return null
  }
}

/**
 * 直接用自定义 prompt 调用 AI，不套用温暖治愈模板
 */
const CLASSIFY_CONFIGS: Record<AIProvider, {
  url: string
  headers: (key: string) => Record<string, string>
  body: (prompt: string) => any
  extract: (data: any) => string
}> = {
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    headers: (key) => ({ 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }),
    body: (prompt) => ({ model: 'claude-sonnet-4-6', max_tokens: 100, messages: [{ role: 'user', content: prompt }] }),
    extract: (data) => data.content?.[0]?.text || '',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: (key) => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }),
    body: (prompt) => ({ model: 'gpt-4o-mini', max_tokens: 100, messages: [{ role: 'user', content: prompt }] }),
    extract: (data) => data.choices?.[0]?.message?.content || '',
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    headers: (key) => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }),
    body: (prompt) => ({ model: 'deepseek-chat', max_tokens: 100, messages: [{ role: 'user', content: prompt }] }),
    extract: (data) => data.choices?.[0]?.message?.content || '',
  },
  qwen: {
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    headers: (key) => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }),
    body: (prompt) => ({ model: 'qwen-plus', input: { messages: [{ role: 'user', content: prompt }] }, parameters: { max_tokens: 100 } }),
    extract: (data) => data.output?.text || '',
  },
}

export async function askAI(provider: AIProvider, apiKey: string, prompt: string): Promise<string | null> {
  const config = CLASSIFY_CONFIGS[provider]
  if (!config) return null
  try {
    const res = await fetch(config.url, { method: 'POST', headers: config.headers(apiKey), body: JSON.stringify(config.body(prompt)) })
    if (!res.ok) return null
    const data = await res.json()
    return config.extract(data) || null
  } catch { return null }
}

const STORAGE_KEY = 'regret_exchange_api_key'

export function getStoredApiKey(): { provider: AIProvider; key: string } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function storeApiKey(provider: AIProvider, key: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, key }))
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}
