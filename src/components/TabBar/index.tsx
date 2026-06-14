import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { switchTab } from '@tarojs/taro'
import './index.scss'

interface TabItem {
  icon: string
  label: string
  path: string
}

const tabs: TabItem[] = [
  { icon: '🏠', label: '主页', path: '/pages/home/index' },
  { icon: '✍️', label: '创作', path: '/pages/creator/index' },
  { icon: '🌌', label: '星图', path: '/pages/starmap/index' },
  { icon: '👤', label: '我的', path: '/pages/profile/index' },
]

interface TabBarProps {
  current: number
}

class TabBar extends Component<TabBarProps> {
  handleTabClick = (index: number, path: string) => {
    if (index === this.props.current) return
    switchTab({ url: path })
  }

  render() {
    const { current } = this.props
    return (
      <View className='tab-bar'>
        {tabs.map((tab, index) => (
          <View
            key={tab.path}
            className={`tab-item ${index === current ? 'tab-item--active' : ''}`}
            onClick={() => this.handleTabClick(index, tab.path)}
          >
            <Text className='tab-item__icon'>{tab.icon}</Text>
            <Text className='tab-item__label'>{tab.label}</Text>
          </View>
        ))}
      </View>
    )
  }
}

export default TabBar
