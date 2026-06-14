import { Component } from 'react'
import { View, Text, Textarea, Button, Switch } from '@tarojs/components'
import { showToast, switchTab } from '@tarojs/taro'
import OceanBackground from '../../components/OceanBackground'
import AuthGuard from '../../components/AuthGuard'
import { createRegret } from '../../services/regrets'
import { detectEmotion } from '../../utils/emotion'
import type { EmotionTag } from '../../types'
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
  submitting: boolean
  charCount: number
}

class Creator extends Component<{}, CreatorState> {
  state: CreatorState = {
    content: '',
    isAnonymous: true,
    emotionTag: null,
    submitting: false,
    charCount: 0,
  }

  handleContentInput = (e: any) => {
    const value = e.detail.value
    if (value.length > MAX_CHARS) return
    this.setState({
      content: value,
      charCount: value.length,
      emotionTag: detectEmotion(value),
    })
  }

  handleAnonymousChange = (e: any) => {
    this.setState({ isAnonymous: e.detail.value })
  }

  handleSubmit = async () => {
    const { content, isAnonymous, emotionTag, submitting } = this.state
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
      })

      if (result) {
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
    const { content, isAnonymous, emotionTag, submitting, charCount } = this.state

    return (
      <AuthGuard>
        <OceanBackground mode='day'>
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
