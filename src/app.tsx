import { useState } from 'react'
import { View } from '@tarojs/components'
import { useLaunch, useDidShow, getCurrentPages } from '@tarojs/taro'
import TabBar from './components/TabBar'
import { useUserStore } from './stores/useUserStore'
import './app.scss'

function App(props: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState(0)
  const initialize = useUserStore((s) => s.initialize)

  useLaunch(() => {
    initialize()
  })

  useDidShow(() => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage) {
      const route = currentPage.route || ''
      const tabMap: Record<string, number> = {
        'pages/home/index': 0,
        'pages/creator/index': 1,
        'pages/starmap/index': 2,
        'pages/profile/index': 3,
      }
      const tabIndex = tabMap[route]
      if (tabIndex !== undefined) {
        setCurrentTab(tabIndex)
      }
    }
  })

  return (
    <View className='app'>
      {props.children}
      <TabBar current={currentTab} />
    </View>
  )
}

export default App
