import { Component } from 'react'
import { View, Text, Textarea, Button, Switch } from '@tarojs/components'
import { showToast, switchTab } from '@tarojs/taro'
import OceanBackground from '../../components/OceanBackground'
import AuthGuard from '../../components/AuthGuard'
import { useThemeStore } from '../../stores/useThemeStore'
import { createRegret } from '../../services/regrets'
import { detectEmotion } from '../../utils/emotion'
import { getStoredApiKey, askAI } from '../../services/ai'
import type { EmotionTag, RegretColor } from '../../types'
import { REGRET_COLORS } from '../../types'
import './index.scss'

const MAX_CHARS = 500

const emotionColorMap: Record<EmotionTag, string> = {
  '思念': '#7ab8d4',
  '懊悔': '#c47a7a',
  '释然': '#7ac48a',
  '遗憾': '#b8a0d4',
  '怀念': '#d4b87a',
  '如果': '#7ab4c4',
  '温柔': '#d4a0b8',
}

interface CreatorState {
  content: string
  isAnonymous: boolean
  emotionTag: EmotionTag | null
  selectedColor: RegretColor
  submitting: boolean
  charCount: number
}

class Creator extends Component<{}, CreatorState> {
  private aiEmotionTimer: number | null = null

  state: CreatorState = {
    content: '',
    isAnonymous: true,
    emotionTag: null,
    selectedColor: 'ocean',
    submitting: false,
    charCount: 0,
  }

  handleContentInput = (e: any) => {
    const value = e.detail.value
    if (value.length > MAX_CHARS) return
    // 先用关键词快速检测
    const tag = detectEmotion(value)
    this.setState({
      content: value,
      charCount: value.length,
      emotionTag: tag,
    })
    // 用户停止输入 1.2 秒后用 AI 精校
    if (this.aiEmotionTimer) clearTimeout(this.aiEmotionTimer)
    if (value.trim().length >= 4) {
      this.aiEmotionTimer = window.setTimeout(() => this.handleAIEmotion(), 1200)
    }
  }

  handleAIEmotion = async () => {
    const { content } = this.state
    if (!content.trim()) return

    const savedKey = getStoredApiKey()
    if (!savedKey) return

    try {
      const result = await askAI(
        savedKey.provider,
        savedKey.key,
        `请用1个双字中文词精准概括这段话的核心情绪（只输出词，不要标点）：\n「${content}」\n例如：不舍、遗憾、思念、释然、怀念、惋惜、愧疚、感伤、温暖、苦涩、落寞、眷恋、怅然、庆幸、期待`,
      )
      if (result) {
        const word = result.replace(/[「」\n\s""]/g, '').trim().substring(0, 6)
        if (word.length >= 2) {
          this.setState({ emotionTag: word })
        }
      }
    } catch {}
  }

  handleAnonymousChange = (e: any) => {
    this.setState({ isAnonymous: e.detail.value })
  }

  handleSubmit = async () => {
    const { content, isAnonymous, emotionTag, selectedColor, submitting } = this.state
    if (submitting) return

    const trimmed = content.trim()
    if (!trimmed) {
      showToast({ title: '请写点什么吧', icon: 'none' })
      return
    }

    this.setState({ submitting: true })

    try {
      const result = await createRegret({
        content: trimmed,
        is_anonymous: isAnonymous,
        emotion_tag: emotionTag,
        regret_color: selectedColor,
      })

      if (result) {
        // 立即重置表单
        this.setState({
          content: '',
          charCount: 0,
          emotionTag: null,
          submitting: false,
          isAnonymous: true,
        })
        showToast({ title: '遗憾已投放', icon: 'success' })
        setTimeout(() => {
          switchTab({ url: '/pages/home/index' })
        }, 1500)
      } else {
        showToast({ title: '发布失败，请重试', icon: 'none' })
        this.setState({ submitting: false })
      }
    } catch {
      showToast({ title: '网络异常，请重试', icon: 'none' })
      this.setState({ submitting: false })
    }
  }

  render() {
    const { content, isAnonymous, emotionTag, selectedColor, submitting, charCount } = this.state
    const mode = useThemeStore.getState().mode

    return (
      <AuthGuard>
        <OceanBackground mode={mode}>
          <View className='creator'>
            {/* Header */}
            <View className='creator__header'>
              <Text className='creator__title'>投放遗憾</Text>
              <Text className='creator__subtitle'>写下那些未曾说出口的话，让海风带走</Text>
            </View>

            {/* Letter-paper textarea */}
            <View className='creator__paper'>
              <Textarea
                className='creator__textarea'
                value={content}
                onInput={this.handleContentInput}
                placeholder='写下你的遗憾...'
                placeholderClass='creator__placeholder'
                maxlength={MAX_CHARS}
                autoHeight
              />
              <View className='creator__paper-footer'>
                <View className='creator__emotion-area'>
                  {emotionTag && (
                    <View
                      className='creator__emotion-badge'
                      style={{
                        backgroundColor: `${emotionColorMap[emotionTag]}26`,
                        color: emotionColorMap[emotionTag],
                        borderColor: `${emotionColorMap[emotionTag]}40`,
                      }}
                    >
                      <Text className='creator__emotion-icon'>✦</Text>
                      <Text>{emotionTag}</Text>
                    </View>
                  )}
                </View>
                <Text
                  className={`creator__charcount ${charCount > MAX_CHARS * 0.9 ? 'creator__charcount--warn' : ''}`}
                >
                  {charCount}/{MAX_CHARS}
                </Text>
              </View>
            </View>

            {/* Color picker */}
            <View className='creator__color-section'>
              <Text className='creator__color-label'>信笺颜色</Text>
              <View className='creator__color-options'>
                {(Object.entries(REGRET_COLORS) as [RegretColor, typeof REGRET_COLORS[RegretColor]][]).map(([key, val]) => (
                  <View
                    key={key}
                    className={`creator__color-dot ${this.state.selectedColor === key ? 'creator__color-dot--active' : ''}`}
                    style={{ backgroundColor: val.hex }}
                    onClick={() => this.setState({ selectedColor: key })}
                  >
                    {this.state.selectedColor === key && (
                      <Text style={{ color: '#fff', fontSize: 14, lineHeight: '28px' }}>✓</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Anonymous toggle */}
            <View className='creator__anonymous'>
              <View className='creator__anonymous-info'>
                <Text className='creator__anonymous-label'>匿名投放</Text>
                <Text className='creator__anonymous-desc'>
                  匿名发布，你的身份将不会显示
                </Text>
              </View>
              <Switch
                color='#7ab8d4'
                checked={isAnonymous}
                onChange={this.handleAnonymousChange}
              />
            </View>

            {/* Submit button */}
            <Button
              className={`creator__submit ${(!content.trim() || submitting) ? 'creator__submit--disabled' : ''}`}
              disabled={!content.trim() || submitting}
              onClick={this.handleSubmit}
            >
              {submitting ? '投放中...' : '投放遗憾'}
            </Button>
          </View>
        </OceanBackground>
      </AuthGuard>
    )
  }
}

export default Creator
