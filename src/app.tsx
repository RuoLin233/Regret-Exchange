import { useState } from 'react'
import { View } from '@tarojs/components'
import { useLaunch, useDidShow, getCurrentPages } from '@tarojs/taro'
import { useUserStore } from './stores/useUserStore'
import { useModalStore } from './stores/useModalStore'
import RegretDetailModal from './components/RegretDetailModal'
import './app.scss'

function App(props: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState(0)
  const initialize = useUserStore((s) => s.initialize)
  const modalVisible = useModalStore((s) => s.visible)
  const modalRegret = useModalStore((s) => s.regret)
  const closeModal = useModalStore((s) => s.close)

  useLaunch(() => {
    initialize()
  })

  useDidShow(() => {
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    if (page) {
      const route = page.route || ''
      const map: Record<string, number> = {
        'pages/home/index': 0,
        'pages/creator/index': 1,
        'pages/starmap/index': 2,
        'pages/profile/index': 3,
      }
      if (map[route] !== undefined) setCurrentTab(map[route])
    }
  })

  return (
    <View className='app'>
      {props.children}
      {/* 全局弹窗，渲染在 app 级别，不被页面和 TabBar 限制 */}
      {modalRegret && (
        <RegretDetailModal
          regret={modalRegret}
          visible={modalVisible}
          onClose={closeModal}
        />
      )}
    </View>
  )
}

export default App
