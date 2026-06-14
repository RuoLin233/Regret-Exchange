import { Component } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import { showToast, switchTab } from '@tarojs/taro'
import OceanBackground from '../../components/OceanBackground'
import { signInWithEmail, verifyOtp } from '../../services/auth'
import { useUserStore } from '../../stores/useUserStore'
import './index.scss'

interface AuthState {
  email: string
  code: string
  step: 'email' | 'code'
  sending: boolean
  verifying: boolean
  error: string | null
}

class Auth extends Component<{}, AuthState> {
  state: AuthState = {
    email: '',
    code: '',
    step: 'email',
    sending: false,
    verifying: false,
    error: null,
  }

  handleEmailInput = (e: any) => {
    this.setState({ email: e.detail.value, error: null })
  }

  handleCodeInput = (e: any) => {
    const value = e.detail.value.replace(/\D/g, '').slice(0, 6)
    this.setState({ code: value, error: null })
  }

  handleSendCode = async () => {
    const { email, sending } = this.state
    if (sending) return

    const trimmed = email.trim()
    if (!trimmed) {
      this.setState({ error: '请输入邮箱地址' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      this.setState({ error: '请输入有效的邮箱地址' })
      return
    }

    this.setState({ sending: true, error: null })

    try {
      const { error } = await signInWithEmail(trimmed)
      if (error) {
        this.setState({ error })
      } else {
        showToast({ title: '验证码已发送', icon: 'success' })
        this.setState({ step: 'code' })
      }
    } catch {
      this.setState({ error: '网络异常，请重试' })
    } finally {
      this.setState({ sending: false })
    }
  }

  handleVerify = async () => {
    const { email, code, verifying } = this.state
    if (verifying) return

    if (code.length < 6) {
      this.setState({ error: '请输入完整的6位验证码' })
      return
    }

    this.setState({ verifying: true, error: null })

    try {
      const { error } = await verifyOtp(email, code)
      if (error) {
        this.setState({ error })
      } else {
        showToast({ title: '登录成功', icon: 'success' })
        await useUserStore.getState().initialize()
        switchTab({ url: '/pages/home/index' })
      }
    } catch {
      this.setState({ error: '验证失败，请重试' })
    } finally {
      this.setState({ verifying: false })
    }
  }

  handleBackToEmail = () => {
    this.setState({ step: 'email', code: '', error: null })
  }

  render() {
    const { email, code, step, sending, verifying, error } = this.state

    return (
      <OceanBackground mode='day'>
        <View className='auth'>
          {/* Header */}
          <View className='auth__header'>
            <Text className='auth__title'>遗憾交易所</Text>
            <Text className='auth__subtitle'>每一份遗憾，都值得被温柔回应</Text>
          </View>

          {/* Card */}
          <View className='auth__card'>
            {step === 'email' ? (
              /* Step 1: Email input */
              <View className='auth__step'>
                <Text className='auth__step-title'>邮箱登录</Text>
                <Text className='auth__step-desc'>
                  输入你的邮箱，我们将发送验证码
                </Text>
                <Input
                  className='auth__input'
                  type='text'
                  placeholder='请输入邮箱地址'
                  value={email}
                  onInput={this.handleEmailInput}
                />
                <Button
                  className={`auth__button ${(!email.trim() || sending) ? 'auth__button--disabled' : ''}`}
                  disabled={!email.trim() || sending}
                  onClick={this.handleSendCode}
                >
                  {sending ? '发送中...' : '发送验证码'}
                </Button>
              </View>
            ) : (
              /* Step 2: Code input */
              <View className='auth__step'>
                <Text className='auth__step-title'>输入验证码</Text>
                <Text className='auth__step-desc'>
                  已发送验证码至 {email}
                </Text>
                <Input
                  className='auth__code-input'
                  type='text'
                  placeholder='000000'
                  value={code}
                  maxlength={6}
                  onInput={this.handleCodeInput}
                />
                <Button
                  className={`auth__button ${(code.length < 6 || verifying) ? 'auth__button--disabled' : ''}`}
                  disabled={code.length < 6 || verifying}
                  onClick={this.handleVerify}
                >
                  {verifying ? '验证中...' : '验证并登录'}
                </Button>
                <Text
                  className='auth__back-link'
                  onClick={this.handleBackToEmail}
                >
                  返回修改邮箱
                </Text>
              </View>
            )}

            {/* Error message */}
            {error && (
              <View className='auth__error'>
                <Text className='auth__error-text'>{error}</Text>
              </View>
            )}
          </View>

          {/* Terms hint */}
          <View className='auth__terms'>
            <Text className='auth__terms-text'>
              登录即表示同意 服务条款 和 隐私政策
            </Text>
          </View>
        </View>
      </OceanBackground>
    )
  }
}

export default Auth
