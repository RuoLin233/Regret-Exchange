import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface TabBarProps {
  current: number
  onSwitch: (index: number) => void
}

const tabLabels = ['主页', '创作', '星图', '我的']
const tabIcons = ['🏠', '✍️', '🌌', '👤']

class TabBar extends Component<TabBarProps> {
  handleTabClick = (index: number) => {
    if (index === this.props.current) return
    this.props.onSwitch(index)
  }

  render() {
    const { current } = this.props
    return (
      <View className='tab-bar'>
        {tabLabels.map((label, index) => (
          <View
            key={label}
            className={`tab-item ${index === current ? 'tab-item--active' : ''}`}
            onClick={() => this.handleTabClick(index)}
          >
            <Text className='tab-item__icon'>{tabIcons[index]}</Text>
            <Text className='tab-item__label'>{label}</Text>
          </View>
        ))}
      </View>
    )
  }
}

export default TabBar
