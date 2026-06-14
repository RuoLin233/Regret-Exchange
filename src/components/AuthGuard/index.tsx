import { useEffect, type FC } from 'react'
import { View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import { useUserStore } from '../../stores/useUserStore'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const user = useUserStore((s) => s.user)
  const isAuthReady = useUserStore((s) => s.isAuthReady)

  useEffect(() => {
    if (isAuthReady && !user) {
      navigateTo({ url: '/pages/auth/index' })
    }
  }, [isAuthReady, user])

  if (!isAuthReady || !user) {
    return <View className='auth-guard-loading' />
  }

  return <>{children}</>
}

export default AuthGuard
