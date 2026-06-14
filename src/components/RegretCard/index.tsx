import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import type { Regret, RegretColor } from '../../types'
import { REGRET_COLORS } from '../../types'
import { formatTimeAgo, getDisappearProgress } from '../../utils/time'
import './index.scss'

function getColorHex(color: RegretColor | null | undefined): string {
  return color ? REGRET_COLORS[color]?.hex || '#c4a882' : '#c4a882'
}

function getMoonPhase(progress: number): string {
  if (progress < 0.125) return '🌑'
  if (progress < 0.25) return '🌒'
  if (progress < 0.375) return '🌓'
  if (progress < 0.5) return '🌔'
  if (progress < 0.625) return '🌕'
  if (progress < 0.75) return '🌖'
  if (progress < 0.875) return '🌗'
  return '🌘'
}

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
    const paperColor = getColorHex(regret.regret_color)
    const progress = getDisappearProgress(regret.created_at)

    return (
      <View
        className={`regret-card regret-card--${variant}`}
        onClick={onClick}
      >
        {/* 信纸颜色覆盖层 */}
        <View
          className='regret-card__tint'
          style={regret.regret_color && regret.regret_color !== 'ocean' ? { backgroundColor: `${paperColor}30` } : {}}
        />

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
            {regret.emotion_tag}
          </View>
        )}

        {/* 内容 */}
        <View className='regret-card__content'>
          <Text className='regret-card__text'>{regret.content}</Text>
        </View>

        {/* 回应预览 */}
        {regret.latest_reply && (
          <View className='regret-card__reply-preview'>
            <Text className='regret-card__reply-text'>「{regret.latest_reply.content.substring(0, 24)}」</Text>
          </View>
        )}

        {/* 底部信息 */}
        <View className='regret-card__footer'>
          <Text className='regret-card__author'>
            {regret.is_anonymous ? '匿名' : regret.user_nickname || '匿名'}
          </Text>
          <Text className='regret-card__meta'>
            {formatTimeAgo(regret.created_at)} · 💧 {regret.reply_count || 0}
          </Text>
        </View>

        {/* 月相消散 */}
        <View className='regret-card__moon'>
          <Text className='regret-card__moon-icon'>{getMoonPhase(progress)}</Text>
          <View className='regret-card__disappear-bar'>
            <View className='regret-card__disappear-fill' style={{ width: `${progress * 100}%` }} />
          </View>
        </View>

        {/* 右下角装饰 */}
        <View className='regret-card__corner' />
      </View>
    )
  }
}

export default RegretCard
