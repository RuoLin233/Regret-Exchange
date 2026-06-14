import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { showToast, showLoading, hideLoading } from '@tarojs/taro'
import OceanBackground from '../../components/OceanBackground'
import RegretCard from '../../components/RegretCard'
import { supabase } from '../../services/supabase'
import { useRegretStore } from '../../stores/useRegretStore'
import { useModalStore } from '../../stores/useModalStore'
import { useUserStore } from '../../stores/useUserStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { getStoredApiKey, generateAIResponse } from '../../services/ai'
import { detectEmotion } from '../../utils/emotion'
import { randomRegretColor } from '../../types'
import type { Regret, EmotionTag } from '../../types'
import './index.scss'

// 本地兜底模板（无 API Key 时使用）
const LOCAL_REGRETS = [
  '如果那天没有转身离开，故事会不会不一样。',
  '有些话藏在心里太久，最后都变成了遗憾。',
  '最怕在某个深夜，突然想起一个不该想起的人。',
  '小时候以为长大是自由，长大后才发现长大是失去。',
  '那封写了又删、删了又写的消息，最终还是没有发出去。',
  '我慢慢变成了一个不哭不闹的人，他们说这叫长大。',
  '如果当时能再坚持一下就好了。',
  '有些再见，是再也不见。',
  '原来最难过的是，连难过都不敢表现出来。',
  '我们之间最大的遗憾，是连一张合照都没有。',
]

function shufflePick(arr: string[], n: number): string[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

class Home extends Component<{}, {}> {
  private unsubscribe: (() => void) | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private themeUnsub: (() => void) | null = null

  componentDidMount() {
    this.themeUnsub = useThemeStore.subscribe(() => this.setState({}))
    useRegretStore.getState().loadRegrets()
    this.unsubscribe = useRegretStore.subscribe(() => {
      this.setState({})
    })
    this.startTimer()
  }

  handleAIGenerate = async () => {
    const savedKey = getStoredApiKey()
    const userId = useUserStore.getState().user?.id
    if (!userId) {
      showToast({ title: '请先等待用户加载', icon: 'none' })
      return
    }

    showLoading({ title: '✨ 正在创作遗憾...' })

    let texts: string[] = []

    if (savedKey) {
      // 有 API Key，用 AI 生成（带情绪标签）
      const prompt = `写3句简短有画面感的遗憾，每句10-20字。
每行：句子|情绪双字词
情绪参考：不舍、遗憾、思念、释然、怀念、惋惜、愧疚、感伤、温暖、苦涩、落寞、眷恋、怅然、庆幸
避免套话，要有具体的细节或画面感，像是普通人会写的。`
      try {
        const result = await generateAIResponse({
          provider: savedKey.provider,
          apiKey: savedKey.key,
          regretContent: prompt,
        })
        if (result) {
          const lines = result.split('\n').filter(l => l.trim())
          for (const line of lines) {
            const parts = line.split('|')
            if (parts.length >= 2) {
              const text = parts[0].trim()
              const tag = parts[1].trim().replace(/[。，！？、]/g, '').substring(0, 6)
              const emotionTag = tag || '遗憾'
              const { error } = await supabase.from('regrets').insert({
                user_id: userId,
                content: text,
                emotion_tag: emotionTag,
                regret_color: randomRegretColor(),
                is_anonymous: true,
              })
              if (!error) inserted++
            } else {
              texts.push(line.trim())
            }
          }
        }
      } catch {}
    }

    // 兜底：用本地模板
    if (inserted === 0) {
      const fallback = texts.length > 0 ? texts : shufflePick(LOCAL_REGRETS, 3)
      for (const text of fallback) {
        const { error } = await supabase.from('regrets').insert({
          user_id: userId,
          content: text,
          emotion_tag: '遗憾',
          regret_color: randomRegretColor(),
          is_anonymous: true,
        })
        if (!error) inserted++
      }
    }

    hideLoading()

    if (inserted > 0) {
      showToast({ title: `✨ 已生成 ${inserted} 条遗憾`, icon: 'success' })
      useRegretStore.getState().refreshRegrets()
    } else {
      showToast({ title: '生成失败，需关闭 RLS', icon: 'none' })
    }
  }

  componentWillUnmount() {
    this.stopTimer()
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    if (this.themeUnsub) {
      this.themeUnsub()
      this.themeUnsub = null
    }
  }

  componentDidShow() {
    useRegretStore.getState().refreshRegrets()
  }

  startTimer() {
    this.timer = setInterval(() => {
      useRegretStore.getState().refreshRegrets()
    }, 60000)
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  handleCardClick = (regret: Regret) => {
    useModalStore.getState().open(regret)
  }

  render() {
    const { regrets, loading } = useRegretStore.getState()
    const mode = useThemeStore.getState().mode

    return (
      <OceanBackground mode={mode}>
        <View className='home'>
          {/* Header */}
          <View className='home__header'>
            <View className='home__header-top'>
              <Text className='home__title'>遗憾交易所</Text>
              <Text className='home__ai-btn' onClick={this.handleAIGenerate}>✨ AI创作</Text>
            </View>
            <Text className='home__subtitle'>每一份遗憾，都值得被温柔回应</Text>
          </View>

          {/* Content */}
          {loading && regrets.length === 0 ? (
            <View className='home__loading'>
              <Text className='home__loading-text'>正在打捞海中的遗憾</Text>
              <View className='home__loading-dots'>
                <Text className='home__loading-dot'>.</Text>
                <Text className='home__loading-dot'>.</Text>
                <Text className='home__loading-dot'>.</Text>
              </View>
            </View>
          ) : regrets.length === 0 ? (
            <View className='home__empty'>
              <Text className='home__empty-icon'>🏖️</Text>
              <Text className='home__empty-text'>还没有人投放遗憾</Text>
              <Text className='home__empty-hint'>去「创作」页面投放你的第一份遗憾吧</Text>
              <Text className='home__empty-hint'>每一份遗憾，都值得被温柔回应</Text>
            </View>
          ) : (
            <ScrollView className='home__list' scrollY>
              <View className='home__grid'>
                {regrets.map((regret) => (
                  <RegretCard
                    key={regret.id}
                    regret={regret}
                    variant='floating'
                    onClick={() => this.handleCardClick(regret)}
                  />
                ))}
                <View className='home__spacer' />
              </View>
            </ScrollView>
          )}

        </View>
      </OceanBackground>
    )
  }
}

export default Home
