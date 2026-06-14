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
        {/* 波浪层 */}
        <View className='ocean-bg__wave ocean-bg__wave--1' />
        <View className='ocean-bg__wave ocean-bg__wave--2' />
        <View className='ocean-bg__wave ocean-bg__wave--3' />

        {/* 波光粼粼 */}
        <View className='ocean-bg__sparkle' />

        {/* 内容层 */}
        <View className='ocean-bg__content'>
          {children}
        </View>
      </View>
    )
  }
}

export default OceanBackground
