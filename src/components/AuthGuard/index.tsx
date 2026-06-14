import { type FC } from 'react'
import { View } from '@tarojs/components'
import { useUserStore } from '../../stores/useUserStore'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const isAuthReady = useUserStore((s) => s.isAuthReady)

  if (!isAuthReady) {
    return <View className='auth-guard-loading' />
  }

  return <>{children}</>
}

export default AuthGuard
