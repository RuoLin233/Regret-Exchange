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
  likes: Record<string, number>
  userLikes: Record<string, boolean>
}

class RegretDetailModal extends Component<RegretDetailModalProps, RegretDetailModalState> {
  state: RegretDetailModalState = {
    replies: [],
    newReply: '',
    loading: false,
    submitting: false,
    likes: {},
    userLikes: {},
  }

  forceTextareaHeight = () => {
    // Taro 的组件内部会覆盖 CSS 高度，需要 JS 强制执行
    setTimeout(() => {
      const wrap = document.querySelector('.modal-sheet__textarea') as HTMLElement
      const inner = wrap?.querySelector('textarea')
      if (wrap) {
        wrap.style.setProperty('height', '44px', 'important')
        wrap.style.setProperty('min-height', '44px', 'important')
      }
      if (inner) {
        inner.style.setProperty('height', '44px', 'important')
        inner.style.setProperty('min-height', '44px', 'important')
      }
      const sendBtn = document.querySelector('.modal-sheet__send-btn') as HTMLElement
      if (sendBtn) {
        sendBtn.style.setProperty('height', '44px', 'important')
        sendBtn.style.setProperty('line-height', '44px', 'important')
      }
    }, 50)
  }

  componentDidMount() {
    if (this.props.visible) {
      this.loadReplies()
      this.forceTextareaHeight()
    }
  }

  componentDidUpdate(prevProps: RegretDetailModalProps) {
    if (this.props.visible && !prevProps.visible) {
      this.loadReplies()
      this.forceTextareaHeight()
    }
  }

  loadReplies = async () => {
    this.setState({ loading: true })
    try {
      const regretId = this.props.regret.id
      console.log('📥 Loading replies for regret:', regretId)
      console.log('📥 Regret content:', this.props.regret.content)
      const replies = await fetchRepliesByRegret(regretId)
      console.log('📥 Replies loaded:', replies?.length)
      if (replies?.length > 0) {
        console.log('📥 First reply:', replies[0].content)
      }
      this.setState({ replies })
    } catch (err) {
      console.error('📥 Failed to load replies:', err)
    } finally {
      this.setState({ loading: false })
    }
  }

  handleInput = (e: any) => {
    this.setState({ newReply: e.detail.value })
  }

  handleSend = async () => {
    const { newReply, submitting } = this.state
    if (!newReply.trim() || submitting) return

    this.setState({ submitting: true })
    showToast({ title: '💌 发送中...', icon: 'none', duration: 1000 })

    try {
      const reply = await Promise.race([
        createReply({
          regret_id: this.props.regret.id,
          content: newReply.trim(),
          type: 'user',
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ])

      if (reply) {
        this.setState((prev) => ({
          replies: [...prev.replies, reply],
          newReply: '',
          submitting: false,
        }))
        showToast({ title: '💧 回应已投递', icon: 'success' })
      } else {
        showToast({ title: '发送失败，请检查 RLS', icon: 'none' })
        this.setState({ submitting: false })
      }
    } catch (err) {
      showToast({ title: '发送超时，或需关闭 RLS', icon: 'none' })
      this.setState({ submitting: false })
    }
  }

  handleDeleteReply = async (replyId: string) => {
    try {
      const { supabase } = await import('../../services/supabase')
      await supabase.from('replies').delete().eq('id', replyId)
      this.setState((prev) => ({
        replies: prev.replies.filter((r) => r.id !== replyId),
      }))
      showToast({ title: '已删除', icon: 'success' })
    } catch {
      showToast({ title: '删除失败', icon: 'none' })
    }
  }

  handleDeleteRegret = async () => {
    try {
      const { supabase } = await import('../../services/supabase')
      await supabase.from('regrets').delete().eq('id', this.props.regret.id)
      showToast({ title: '遗憾已删除', icon: 'success' })
      this.props.onClose()
      // 刷新首页
      const { useRegretStore } = await import('../../stores/useRegretStore')
      useRegretStore.getState().refreshRegrets()
    } catch {
      showToast({ title: '删除失败', icon: 'none' })
    }
  }

  handleLike = (replyId: string) => {
    this.setState((prev) => {
      const isLiked = prev.userLikes[replyId]
      return {
        userLikes: { ...prev.userLikes, [replyId]: !isLiked },
        likes: {
          ...prev.likes,
          [replyId]: (prev.likes[replyId] || 0) + (isLiked ? -1 : 1),
        },
      }
    })
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
              <View style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Text
                  className='modal-sheet__delete-regret'
                  onClick={this.handleDeleteRegret}
                >
                  🗑️ 删除
                </Text>
                <Text className='modal-sheet__close' onClick={onClose}>
                  关闭
                </Text>
              </View>
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
              replies.map((reply) => {
                const isLiked = this.state.userLikes[reply.id]
                const likeCount = this.state.likes[reply.id] || 0
                return (
                <View key={reply.id} className='modal-sheet__reply-item'>
                  <View className='modal-sheet__reply-header'>
                    <Text className='modal-sheet__reply-author'>
                      {reply.user_nickname || '匿名'}
                    </Text>
                    {reply.type === 'ai' && (
                      <Text className='modal-sheet__reply-type-badge'>AI</Text>
                    )}
                    <Text className='modal-sheet__reply-time'>
                      {formatTimeAgo(reply.created_at)}
                    </Text>
                    <Text
                      className='modal-sheet__reply-delete'
                      onClick={() => this.handleDeleteReply(reply.id)}
                    >🗑️</Text>
                  </View>
                  <Text className='modal-sheet__reply-content'>
                    {reply.content}
                  </Text>
                  <View className='modal-sheet__reply-actions'>
                    <Text
                      className={`modal-sheet__like-btn ${isLiked ? 'modal-sheet__like-btn--active' : ''}`}
                      onClick={() => this.handleLike(reply.id)}
                    >
                      {isLiked ? '💖' : '🤍'} {likeCount > 0 ? likeCount : ''}
                    </Text>
                  </View>
                </View>
                )
              })
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
                rows={2}
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
