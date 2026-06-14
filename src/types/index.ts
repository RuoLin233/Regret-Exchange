// AI 服务商
export type AIProvider = 'claude' | 'openai' | 'deepseek' | 'qwen';

// API Key 存储格式
export interface APIKeyConfig {
  provider: AIProvider;
  key: string;
}

// 情绪标签（自由文本，由 AI 根据内容生成）
export type EmotionTag = string;

// 遗憾颜色（海岸信笺主题6色）
export type RegretColor = 'ocean' | 'gold' | 'coral' | 'seafoam' | 'lavender' | 'sand';

export const REGRET_COLORS: Record<RegretColor, { name: string; hex: string; emoji: string }> = {
  ocean:    { name: '海蓝', hex: '#5a8abc', emoji: '🌊' },
  gold:     { name: '暖金', hex: '#d4a85a', emoji: '🌅' },
  coral:    { name: '珊瑚', hex: '#d47a7a', emoji: '🌸' },
  seafoam:  { name: '泡沫', hex: '#7ac48a', emoji: '🌿' },
  lavender: { name: '薰衣草', hex: '#8a7ac4', emoji: '🫐' },
  sand:     { name: '沙砾', hex: '#c9a96e', emoji: '☀️' },
};

export function randomRegretColor(): RegretColor {
  const keys = Object.keys(REGRET_COLORS) as RegretColor[];
  return keys[Math.floor(Math.random() * keys.length)];
}

// 用户资料
export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  created_at: string;
}

// 遗憾
export interface Regret {
  id: string;
  user_id: string;
  content: string;
  emotion_tag: EmotionTag | null;
  regret_color: RegretColor | null;
  is_anonymous: boolean;
  created_at: string;
  disappear_at: string;
  is_visible: boolean;
  reply_count?: number;
  latest_reply?: { content: string } | null;
  user_nickname?: string;
}

// 回应
export interface Reply {
  id: string;
  regret_id: string;
  user_id: string;
  content: string;
  type: 'user' | 'ai';
  created_at: string;
  user_nickname?: string;
}

// 创建遗憾请求
export interface CreateRegretInput {
  content: string;
  is_anonymous: boolean;
  emotion_tag?: EmotionTag | null;
  regret_color?: RegretColor | null;
}

// 创建回应请求
export interface CreateReplyInput {
  regret_id: string;
  content: string;
  type: 'user' | 'ai';
}

// 用户统计
export interface UserStats {
  regrets_count: number;
  replies_count: number;
}

// AI 生成请求配置
export interface AIGenerateInput {
  provider: AIProvider;
  apiKey: string;
  regretContent: string;
}
