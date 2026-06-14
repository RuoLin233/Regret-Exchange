import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { showToast } from '@tarojs/taro'
import OceanBackground from '../../components/OceanBackground'
import AuthGuard from '../../components/AuthGuard'
import RegretCard from '../../components/RegretCard'
import { supabase } from '../../services/supabase'
import { useUserStore } from '../../stores/useUserStore'
import { fetchUserRegrets } from '../../services/regrets'
import { fetchUserReplies } from '../../services/replies'
import { formatTimeAgo } from '../../utils/time'
import type { Regret, Reply } from '../../types'
import './index.scss'

interface StarMapState {
  regrets: Regret[]
  replies: Reply[]
  stats: { regrets_count: number; replies_count: number }
  loading: boolean
  activeTab: 'regrets' | 'replies'
}

class StarMap extends Component<{}, StarMapState> {
  state: StarMapState = {
    regrets: [],
    replies: [],
    stats: { regrets_count: 0, replies_count: 0 },
    loading: true,
    activeTab: 'regrets',
  }

  async loadData() {
    const user = useUserStore.getState().user
    if (!user) {
      // 用户还没加载好，延迟重试
      setTimeout(() => this.loadData(), 500)
      return
    }
    const [regrets, replies] = await Promise.all([
      fetchUserRegrets(user.id),
      fetchUserReplies(user.id),
    ])
    this.setState({
      regrets,
      replies,
      stats: { regrets_count: regrets.length, replies_count: replies.length },
      loading: false,
    })
  }

  handleDeleteRegret = async (id: string) => {
    try {
      await supabase.from('regrets').delete().eq('id', id)
      showToast({ title: '已删除', icon: 'success' })
      this.loadData()
    } catch { showToast({ title: '删除失败', icon: 'none' }) }
  }

  handleDeleteReply = async (id: string) => {
    try {
      await supabase.from('replies').delete().eq('id', id)
      showToast({ title: '已删除', icon: 'success' })
      this.loadData()
    } catch { showToast({ title: '删除失败', icon: 'none' }) }
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidShow() {
    this.loadData()
  }

  render() {
    const { regrets, replies, stats, loading, activeTab } = this.state
    return (
      <AuthGuard>
        <OceanBackground mode='night'>
          <View className='starmap'>
            {/* Header with constellation */}
            <View className='starmap__header'>
              <View className='starmap__constellation'>
                <View className='starmap__star starmap__star--1' />
                <View className='starmap__star starmap__star--2' />
                <View className='starmap__star starmap__star--3' />
                <View className='starmap__star starmap__star--4' />
                <View className='starmap__star starmap__star--5' />
                <View className='starmap__star starmap__star--6' />
                <View className='starmap__star starmap__star--7' />
                <svg className='starmap__lines' viewBox='0 0 200 100' preserveAspectRatio='none'>
                  <line x1='30' y1='30' x2='56' y2='18' stroke='rgba(200,230,255,0.3)' strokeWidth='0.8' />
                  <line x1='56' y1='18' x2='84' y2='25' stroke='rgba(200,230,255,0.3)' strokeWidth='0.8' />
                  <line x1='84' y1='25' x2='110' y2='35' stroke='rgba(200,230,255,0.3)' strokeWidth='0.8' />
                  <line x1='110' y1='35' x2='136' y2='22' stroke='rgba(200,230,255,0.3)' strokeWidth='0.8' />
                  <line x1='136' y1='22' x2='160' y2='30' stroke='rgba(200,230,255,0.3)' strokeWidth='0.8' />
                  <line x1='160' y1='30' x2='184' y2='18' stroke='rgba(200,230,255,0.3)' strokeWidth='0.8' />
                </svg>
              </View>
              <Text className='starmap__title'>我的星群</Text>
              <Text className='starmap__subtitle'>每一颗星都是一段故事</Text>
            </View>

            {/* User stats */}
            <View className='starmap__stats'>
              <View className='starmap__stat'>
                <Text className='starmap__stat-number'>{stats.regrets_count}</Text>
                <Text className='starmap__stat-label'>遗憾</Text>
              </View>
              <View className='starmap__stat-divider' />
              <View className='starmap__stat'>
                <Text className='starmap__stat-number'>{stats.replies_count}</Text>
                <Text className='starmap__stat-label'>回应</Text>
              </View>
              <View className='starmap__stat-divider' />
              <View className='starmap__stat'>
                <Text className='starmap__stat-number'>{stats.regrets_count + stats.replies_count}</Text>
                <Text className='starmap__stat-label'>星数</Text>
              </View>
            </View>

            {/* Tab bar */}
            <View className='starmap__tabs'>
              <View
                className={`starmap__tab ${activeTab === 'regrets' ? 'starmap__tab--active' : ''}`}
                onClick={() => this.setState({ activeTab: 'regrets' })}
              >
                <Text className='starmap__tab-label'>我的遗憾</Text>
                <Text className='starmap__tab-count'>{stats.regrets_count}</Text>
              </View>
              <View
                className={`starmap__tab ${activeTab === 'replies' ? 'starmap__tab--active' : ''}`}
                onClick={() => this.setState({ activeTab: 'replies' })}
              >
                <Text className='starmap__tab-label'>我的回应</Text>
                <Text className='starmap__tab-count'>{stats.replies_count}</Text>
              </View>
            </View>

            {/* Content */}
            <ScrollView className='starmap__list' scrollY>
              {loading ? (
                <View className='starmap__status'>
                  <Text className='starmap__status-text'>正在仰望星空...</Text>
                </View>
              ) : activeTab === 'regrets' ? (
                regrets.length === 0 ? (
                  <View className='starmap__status'>
                    <Text className='starmap__status-icon'>🌠</Text>
                    <Text className='starmap__status-text'>还没有遗憾划过天际</Text>
                  </View>
                ) : (
                  <View className='starmap__grid'>
                    {regrets.map((regret) => (
                      <View key={regret.id} className='starmap__regret-wrapper'>
                        <RegretCard regret={regret} variant='compact' />
                        <Text className='starmap__delete-btn' onClick={() => this.handleDeleteRegret(regret.id)}>🗑️</Text>
                      </View>
                    ))}
                  </View>
                )
              ) : (
                replies.length === 0 ? (
                  <View className='starmap__status'>
                    <Text className='starmap__status-icon'>💫</Text>
                    <Text className='starmap__status-text'>还没有回应过别人</Text>
                  </View>
                ) : (
                  <View className='starmap__grid'>
                    {replies.map((reply) => (
                      <View key={reply.id} className='starmap__reply-item'>
                        <View className='starmap__reply-header-bar'>
                          <Text className='starmap__reply-content'>{reply.content}</Text>
                          <Text className='starmap__delete-btn' onClick={() => this.handleDeleteReply(reply.id)}>🗑️</Text>
                        </View>
                        <View className='starmap__reply-footer'>
                          <Text className='starmap__reply-tag'>
                            {reply.type === 'ai' ? '✨ AI' : '✍️ 手写'}
                          </Text>
                          <Text className='starmap__reply-time'>
                            {formatTimeAgo(reply.created_at)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )
              )}
              <View className='starmap__spacer' />
            </ScrollView>
          </View>
        </OceanBackground>
      </AuthGuard>
    )
  }
}

export default StarMap
