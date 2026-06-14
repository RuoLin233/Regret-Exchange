import { Component } from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface OceanBackgroundProps {
  mode?: 'day' | 'night'
  children?: React.ReactNode
}

class OceanBackground extends Component<OceanBackgroundProps> {
  render() {
    const { mode = 'day', children } = this.props
    return (
      <View className={`ocean-bg ocean-bg--${mode}`}>
        {/* 太阳/月亮光晕 */}
        <View className='ocean-bg__orb' />

        {/* 波光粼粼粒子 */}
        <View className='ocean-bg__particles'>
          {Array.from({ length: 25 }).map((_, i) => (
            <View
              key={i}
              className='ocean-bg__particle'
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${20 + Math.random() * 50}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </View>

        {/* 海鸥（仅桌面端可见） */}
        <View className='ocean-bg__seagull ocean-bg__seagull--1' />
        <View className='ocean-bg__seagull ocean-bg__seagull--2' />

        {/* 泡沫粒子（从海面上升） */}
        <View className='ocean-bg__bubbles'>
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              className='ocean-bg__bubble'
              style={{
                left: `${5 + Math.random() * 90}%`,
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 6}s`,
              }}
            />
          ))}
        </View>

        {/* 波浪层 */}
        <View className='ocean-bg__wave ocean-bg__wave--1' />
        <View className='ocean-bg__wave ocean-bg__wave--2' />
        <View className='ocean-bg__wave ocean-bg__wave--3' />
        <View className='ocean-bg__wave ocean-bg__wave--4' />

        {/* 内容层 */}
        <View className='ocean-bg__content'>
          {children}
        </View>
      </View>
    )
  }
}

export default OceanBackground
