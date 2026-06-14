import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import OceanBackground from '../../components/OceanBackground'
import AuthGuard from '../../components/AuthGuard'
import RegretCard from '../../components/RegretCard'
import { useUserStore } from '../../stores/useUserStore'
import { fetchUserRegrets } from '../../services/regrets'
import { fetchUserReplies } from '../../services/replies'
import { formatTimeAgo } from '../../utils/time'
import type { Regret, Reply } from '../../types'
import './index.scss'

interface StarConfig {
  left: string
  top: string
  opacity: number
  size: string
  delay: number
}

interface StarmapState {
  regrets: Regret[]
  replies: Reply[]
  loading: boolean
  activeTab: 'regrets' | 'replies'
}

function generateStars(count: number): StarConfig[] {
  const stars: StarConfig[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      opacity: 0.3 + Math.random() * 0.7,
      size: `${10 + Math.random() * 16}px`,
      delay: Math.random() * 5,
    })
  }
  return stars
}

class Starmap extends Component<{}, StarmapState> {
  private stars: StarConfig[] = generateStars(30)

  state: StarmapState = {
    regrets: [],
    replies: [],
    loading: true,
    activeTab: 'regrets',
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidShow() {
    this.loadData()
  }

  loadData = async () => {
    const user = useUserStore.getState().user
    if (!user) {
      this.setState({ loading: false })
      return
    }

    this.setState({ loading: true })

    try {
      const [regrets, replies] = await Promise.all([
        fetchUserRegrets(user.id),
        fetchUserReplies(user.id),
      ])
      this.setState({ regrets, replies, loading: false })
    } catch {
      this.setState({ loading: false })
    }
  }

  switchTab = (tab: 'regrets' | 'replies') => {
    this.setState({ activeTab: tab })
  }

  renderStars() {
    return this.stars.map((star, i) => (
      <Text
        key={i}
        className='starmap__star'
        style={{
          left: star.left,
          top: star.top,
          opacity: star.opacity,
          fontSize: star.size,
          animationDelay: `${star.delay}s`,
        }}
      >
        ✦
      </Text>
    ))
  }

  renderTabs() {
    const { activeTab, regrets, replies } = this.state

    return (
      <View className='starmap__tabs'>
        <View
          className={`starmap__tab ${activeTab === 'regrets' ? 'starmap__tab--active' : ''}`}
          onClick={() => this.switchTab('regrets')}
        >
          <Text className='starmap__tab-text'>
            我的遗憾 ({regrets.length})
          </Text>
        </View>
        <View
          className={`starmap__tab ${activeTab === 'replies' ? 'starmap__tab--active' : ''}`}
          onClick={() => this.switchTab('replies')}
        >
          <Text className='starmap__tab-text'>
            我的回应 ({replies.length})
          </Text>
        </View>
      </View>
    )
  }

  renderRegrets() {
    const { regrets, loading } = this.state

    if (loading && regrets.length === 0) {
      return (
        <View className='starmap__loading'>
          <Text className='starmap__loading-text'>加载中...</Text>
        </View>
      )
    }

    if (regrets.length === 0) {
      return (
        <View className='starmap__empty'>
          <Text className='starmap__empty-icon'>💫</Text>
          <Text className='starmap__empty-text'>还没有投放遗憾</Text>
          <Text className='starmap__empty-hint'>去「创作」页面投放你的第一份遗憾吧</Text>
        </View>
      )
    }

    return (
      <ScrollView className='starmap__list' scrollY>
        {regrets.map((regret) => (
          <RegretCard key={regret.id} regret={regret} variant='compact' />
        ))}
        <View className='starmap__spacer' />
      </ScrollView>
    )
  }

  renderReplies() {
    const { replies, loading } = this.state

    if (loading && replies.length === 0) {
      return (
        <View className='starmap__loading'>
          <Text className='starmap__loading-text'>加载中...</Text>
        </View>
      )
    }

    if (replies.length === 0) {
      return (
        <View className='starmap__empty'>
          <Text className='starmap__empty-icon'>🌙</Text>
          <Text className='starmap__empty-text'>还没有回应过遗憾</Text>
          <Text className='starmap__empty-hint'>去「主页」回应那些触动你的遗憾吧</Text>
        </View>
      )
    }

    return (
      <ScrollView className='starmap__list' scrollY>
        {replies.map((reply) => (
          <View key={reply.id} className='starmap__reply-card'>
            <View className='starmap__reply-type'>
              <Text className={`starmap__reply-type-tag starmap__reply-type-tag--${reply.type}`}>
                {reply.type === 'ai' ? 'AI 回应' : '我的回应'}
              </Text>
            </View>
            <View className='starmap__reply-content'>
              <Text className='starmap__reply-text'>{reply.content}</Text>
            </View>
            <View className='starmap__reply-meta'>
              <Text className='starmap__reply-time'>
                {formatTimeAgo(reply.created_at)}
              </Text>
            </View>
          </View>
        ))}
        <View className='starmap__spacer' />
      </ScrollView>
    )
  }

  render() {
    const { regrets, replies } = this.state

    return (
      <AuthGuard>
        <OceanBackground mode='night'>
          <View className='starmap'>
            {/* Stars decoration */}
            {this.renderStars()}

            {/* Header */}
            <View className='starmap__header'>
              <Text className='starmap__title'>🌌 我的星群</Text>
              <Text className='starmap__subtitle'>
                {regrets.length + replies.length} 段记忆
              </Text>
            </View>

            {/* Tabs */}
            {this.renderTabs()}

            {/* Content */}
            <View className='starmap__content'>
              {this.state.activeTab === 'regrets' ? this.renderRegrets() : this.renderReplies()}
            </View>
          </View>
        </OceanBackground>
      </AuthGuard>
    )
  }
}

export default Starmap
