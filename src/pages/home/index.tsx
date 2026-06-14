import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import OceanBackground from '../../components/OceanBackground'
import RegretCard from '../../components/RegretCard'
import RegretDetailModal from '../../components/RegretDetailModal'
import { useRegretStore } from '../../stores/useRegretStore'
import type { Regret } from '../../types'
import './index.scss'

interface HomeState {
  selectedRegret: Regret | null
  modalVisible: boolean
}

class Home extends Component<{}, HomeState> {
  private unsubscribe: (() => void) | null = null
  private timer: ReturnType<typeof setInterval> | null = null

  state: HomeState = {
    selectedRegret: null,
    modalVisible: false,
  }

  componentDidMount() {
    useRegretStore.getState().loadRegrets()
    this.unsubscribe = useRegretStore.subscribe(() => {
      this.setState({})
    })
    this.startTimer()
  }

  componentWillUnmount() {
    this.stopTimer()
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
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
    this.setState({
      selectedRegret: regret,
      modalVisible: true,
    })
  }

  handleModalClose = () => {
    this.setState({
      modalVisible: false,
      selectedRegret: null,
    })
  }

  handleRefresh = () => {
    useRegretStore.getState().refreshRegrets()
  }

  render() {
    const { regrets, loading, refreshing } = useRegretStore.getState()
    const { selectedRegret, modalVisible } = this.state

    return (
      <OceanBackground mode='day'>
        <View className='home'>
          {/* Header */}
          <View className='home__header'>
            <Text className='home__title'>遗憾交易所</Text>
            <Text className='home__subtitle'>每一份遗憾，都值得被温柔回应</Text>
          </View>

          {/* Content */}
          {loading && regrets.length === 0 ? (
            <View className='home__loading'>
              <Text className='home__loading-text'>正在打捞海中的遗憾...</Text>
            </View>
          ) : regrets.length === 0 ? (
            <View className='home__empty'>
              <Text className='home__empty-icon'>🌊</Text>
              <Text className='home__empty-text'>还没有人投放遗憾</Text>
              <Text className='home__empty-hint'>去「创作」页面投放你的第一份遗憾吧</Text>
            </View>
          ) : (
            <ScrollView
              className='home__list'
              scrollY
              refresherEnabled
              refresherTriggered={refreshing}
              onRefresherRefresh={this.handleRefresh}
            >
              {regrets.map((regret) => (
                <RegretCard
                  key={regret.id}
                  regret={regret}
                  variant='floating'
                  onClick={() => this.handleCardClick(regret)}
                />
              ))}
              {/* Bottom spacer for tab bar */}
              <View className='home__spacer' />
            </ScrollView>
          )}

          {/* Detail Modal */}
          {selectedRegret && (
            <RegretDetailModal
              regret={selectedRegret}
              visible={modalVisible}
              onClose={this.handleModalClose}
            />
          )}
        </View>
      </OceanBackground>
    )
  }
}

export default Home
