// AI 服务商
export type AIProvider = 'claude' | 'openai' | 'deepseek' | 'qwen';

// API Key 存储格式
export interface APIKeyConfig {
  provider: AIProvider;
  key: string;
}

// 情绪标签
export type EmotionTag = '思念' | '懊悔' | '释然' | '遗憾' | '怀念' | '如果' | '温柔';

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
  is_anonymous: boolean;
  created_at: string;
  disappear_at: string;
  is_visible: boolean;
  reply_count?: number;
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
