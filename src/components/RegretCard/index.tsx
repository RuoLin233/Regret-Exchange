import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import type { Regret } from '../../types'
import { formatTimeAgo, getDisappearProgress } from '../../utils/time'
import './index.scss'

interface RegretCardProps {
  regret: Regret
  onClick?: () => void
  variant?: 'floating' | 'compact'
}

class RegretCard extends Component<RegretCardProps> {
  getEmotionColor = (tag: string | null): string => {
    const colors: Record<string, string> = {
      '思念': '#7ab8d4',
      '懊悔': '#c47a7a',
      '释然': '#7ac48a',
      '遗憾': '#b8a0d4',
      '怀念': '#d4b87a',
      '如果': '#7ab4c4',
      '温柔': '#d4a0b8',
    }
    return tag ? colors[tag] || '#aabbcc' : '#aabbcc'
  }

  render() {
    const { regret, onClick, variant = 'floating' } = this.props
    const emotionColor = this.getEmotionColor(regret.emotion_tag)

    return (
      <View
        className={`regret-card regret-card--${variant}`}
        onClick={onClick}
      >
        {/* 情绪标签 */}
        {regret.emotion_tag && (
          <View
            className='regret-card__emotion'
            style={{
              backgroundColor: `${emotionColor}20`,
              color: emotionColor,
              borderColor: `${emotionColor}30`,
            }}
          >
            🐚 {regret.emotion_tag}
          </View>
        )}

        {/* 内容 */}
        <View className='regret-card__content'>
          <Text className='regret-card__text'>{regret.content}</Text>
        </View>

        {/* 底部信息 */}
        <View className='regret-card__footer'>
          <Text className='regret-card__author'>
            {regret.is_anonymous ? '匿名' : regret.user_nickname || '匿名'}
          </Text>
          <Text className='regret-card__meta'>
            {formatTimeAgo(regret.created_at)} · 💧 {regret.reply_count || 0}
          </Text>
        </View>

        {/* 消散进度条 */}
        <View className='regret-card__disappear-bar'>
          <View
            className='regret-card__disappear-fill'
            style={{ width: `${getDisappearProgress(regret.created_at) * 100}%` }}
          />
        </View>
      </View>
    )
  }
}

export default RegretCard
