import { Component } from 'react'
import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components'
import { showToast, showLoading, hideLoading } from '@tarojs/taro'
import type { Regret, Reply } from '../../types'
import { fetchRepliesByRegret, createReply } from '../../services/replies'
import { getStoredApiKey, generateAIResponse } from '../../services/ai'
import { formatTimeAgo } from '../../utils/time'
import './index.scss'

interface RegretDetailModalProps {
  regret: Regret
  visible: boolean
  onClose: () => void
}

interface RegretDetailModalState {
  replies: Reply[]
  newReply: string
  loading: boolean
  submitting: boolean
}

class RegretDetailModal extends Component<RegretDetailModalProps, RegretDetailModalState> {
  state: RegretDetailModalState = {
    replies: [],
    newReply: '',
    loading: false,
    submitting: false,
  }

  componentDidUpdate(prevProps: RegretDetailModalProps) {
    if (this.props.visible && !prevProps.visible) {
      this.loadReplies()
    }
  }

  loadReplies = async () => {
    this.setState({ loading: true })
    try {
      const replies = await fetchRepliesByRegret(this.props.regret.id)
      this.setState({ replies })
    } catch (err) {
      console.error('Failed to load replies:', err)
    } finally {
      this.setState({ loading: false })
    }
  }

  handleInput = (e: any) => {
    this.setState({ newReply: e.detail.value })
  }

  handleSend = async () => {
    const { newReply } = this.state
    if (!newReply.trim()) return

    this.setState({ submitting: true })
    try {
      const reply = await createReply({
        regret_id: this.props.regret.id,
        content: newReply.trim(),
        type: 'user',
      })
      if (reply) {
        this.setState((prev) => ({
          replies: [...prev.replies, reply],
          newReply: '',
        }))
      }
    } catch (err) {
      showToast({ title: '发送失败', icon: 'none' })
    } finally {
      this.setState({ submitting: false })
    }
  }

  handleAIGenerate = async () => {
    const savedKey = getStoredApiKey()
    if (!savedKey) {
      showToast({ title: '请先在「我的」页面配置 API Key', icon: 'none' })
      return
    }

    showLoading({ title: '✨ 正在生成光...' })
    const result = await generateAIResponse({
      provider: savedKey.provider,
      apiKey: savedKey.key,
      regretContent: this.props.regret.content,
    })
    hideLoading()

    if (result) {
      this.setState({ submitting: true })
      const reply = await createReply({
        regret_id: this.props.regret.id,
        content: result,
        type: 'ai',
      })
      if (reply) {
        this.setState((prev) => ({
          replies: [...prev.replies, reply],
          submitting: false,
        }))
        showToast({ title: '✨ 光已送达', icon: 'success' })
      } else {
        this.setState({ submitting: false })
        showToast({ title: '提交失败，请重试', icon: 'none' })
      }
    } else {
      showToast({ title: '生成失败，请检查 API Key 是否有效', icon: 'none' })
    }
  }

  render() {
    const { regret, visible, onClose } = this.props
    const { replies, newReply, loading, submitting } = this.state

    if (!visible) return null

    return (
      <View className='modal-overlay' onClick={onClose}>
        <View
          className='modal-sheet'
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {/* Header with drag handle */}
          <View className='modal-sheet__header'>
            <View className='modal-sheet__handle' />
            <View className='modal-sheet__header-top'>
              <Text className='modal-sheet__title'>回应遗憾</Text>
              <Text className='modal-sheet__close' onClick={onClose}>
                关闭
              </Text>
            </View>
          </View>

          {/* Regret content section */}
          <View className='modal-sheet__regret'>
            <View className='modal-sheet__regret-header'>
              {regret.emotion_tag && (
                <Text className='modal-sheet__emotion-tag'>
                  🐚 {regret.emotion_tag}
                </Text>
              )}
              <Text className='modal-sheet__author'>
                {regret.is_anonymous
                  ? '匿名'
                  : regret.user_nickname || '匿名'}
              </Text>
              <Text className='modal-sheet__time'>
                {formatTimeAgo(regret.created_at)}
              </Text>
            </View>
            <Text className='modal-sheet__content'>{regret.content}</Text>
          </View>

          {/* Replies list */}
          <ScrollView className='modal-sheet__replies' scrollY>
            {loading ? (
              <View className='modal-sheet__replies-loading'>
                <Text>加载回应中...</Text>
              </View>
            ) : replies.length === 0 ? (
              <View className='modal-sheet__replies-empty'>
                <Text>还没有回应，来写下你的第一份回应吧</Text>
              </View>
            ) : (
              replies.map((reply) => (
                <View key={reply.id} className='modal-sheet__reply-item'>
                  <View className='modal-sheet__reply-header'>
                    <Text className='modal-sheet__reply-author'>
                      {reply.user_nickname || '匿名'}
                    </Text>
                    {reply.type === 'ai' && (
                      <Text className='modal-sheet__reply-type-badge'>
                        AI
                      </Text>
                    )}
                    <Text className='modal-sheet__reply-time'>
                      {formatTimeAgo(reply.created_at)}
                    </Text>
                  </View>
                  <Text className='modal-sheet__reply-content'>
                    {reply.content}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Composer section */}
          <View className='modal-sheet__composer'>
            <View className='modal-sheet__composer-input-area'>
              <Textarea
                className='modal-sheet__textarea'
                placeholder='写下你的回应...'
                value={newReply}
                onInput={this.handleInput}
                maxlength={500}
                autoHeight
              />
              <Button
                className='modal-sheet__send-btn'
                onClick={this.handleSend}
                disabled={!newReply.trim() || submitting}
              >
                {submitting ? '发送中...' : '发送'}
              </Button>
            </View>
            <Button
              className='modal-sheet__ai-btn'
              onClick={this.handleAIGenerate}
            >
              ✨ AI 生成回应
            </Button>
          </View>
        </View>
      </View>
    )
  }
}

export default RegretDetailModal
