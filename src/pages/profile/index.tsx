import { Component } from 'react'
import { View, Text, Button, Input, Picker } from '@tarojs/components'
import { showToast, showModal, reLaunch } from '@tarojs/taro'
import OceanBackground from '../../components/OceanBackground'
import AuthGuard from '../../components/AuthGuard'
import { useThemeStore } from '../../stores/useThemeStore'
import { useUserStore } from '../../stores/useUserStore'
import { updateProfile } from '../../services/auth'
import { fetchUserStats } from '../../services/regrets'
import { getStoredApiKey, storeApiKey, clearApiKey } from '../../services/ai'
import type { AIProvider, UserStats } from '../../types'
import './index.scss'

const AI_PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'qwen', label: '通义千问' },
]

const AI_PROVIDER_LABELS = AI_PROVIDERS.map(p => p.label)

interface ProfileState {
  nickname: string
  editingNickname: string
  stats: UserStats
  aiProvider: AIProvider
  aiKey: string
  hasConfiguredKey: boolean
  showKeyInput: boolean
  saving: boolean
  editing: boolean
}

class Profile extends Component<{}, ProfileState> {
  private themeUnsub: (() => void) | null = null

  state: ProfileState = {
    nickname: '',
    editingNickname: '',
    stats: { regrets_count: 0, replies_count: 0 },
    aiProvider: 'claude',
    aiKey: '',
    hasConfiguredKey: false,
    showKeyInput: false,
    saving: false,
    editing: false,
  }

  componentDidMount() {
    this.themeUnsub = useThemeStore.subscribe(() => this.setState({}))
    this.loadData()
  }

  componentWillUnmount() {
    if (this.themeUnsub) {
      this.themeUnsub()
      this.themeUnsub = null
    }
  }

  componentDidShow() {
    this.loadData()
  }

  loadData = async () => {
    const { user, profile } = useUserStore.getState()

    if (!user) return

    // Load profile info
    const nickname = profile?.nickname || user.email?.split('@')[0] || '用户'
    this.setState({ nickname, editingNickname: nickname })

    // Load stats
    const stats = await fetchUserStats(user.id)
    this.setState({ stats })

    // Load stored API key config
    const stored = getStoredApiKey()
    if (stored) {
      this.setState({
        aiProvider: stored.provider,
        aiKey: stored.key,
        hasConfiguredKey: true,
      })
    }
  }

  handleStartEdit = () => {
    this.setState({ editing: true })
  }

  handleNicknameInput = (e: any) => {
    this.setState({ editingNickname: e.detail.value })
  }

  handleSaveNickname = async () => {
    const { editingNickname, saving } = this.state
    if (saving) return

    const trimmed = editingNickname.trim()
    if (!trimmed) {
      showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }

    const user = useUserStore.getState().user
    if (!user) return

    this.setState({ saving: true })

    try {
      const { error } = await updateProfile(user.id, { nickname: trimmed })
      if (error) {
        showToast({ title: error, icon: 'none' })
      } else {
        showToast({ title: '昵称已更新', icon: 'success' })
        this.setState({ nickname: trimmed, editing: false })
        await useUserStore.getState().refreshProfile()
      }
    } catch {
      showToast({ title: '更新失败，请重试', icon: 'none' })
    } finally {
      this.setState({ saving: false })
    }
  }

  handleCancelEdit = () => {
    const { nickname } = this.state
    this.setState({ editing: false, editingNickname: nickname })
  }

  handleShowKeyInput = () => {
    const stored = getStoredApiKey()
    this.setState({
      showKeyInput: true,
      aiProvider: stored?.provider || 'claude',
      aiKey: stored?.key || '',
    })
  }

  handleHideKeyInput = () => {
    this.setState({ showKeyInput: false })
  }

  handleProviderChange = (e: any) => {
    const index = e.detail.value
    const provider = AI_PROVIDERS[index]?.value || 'claude'
    this.setState({ aiProvider: provider })
  }

  handleKeyInput = (e: any) => {
    this.setState({ aiKey: e.detail.value })
  }

  handleSaveKey = async () => {
    const { aiProvider, aiKey } = this.state
    if (!aiKey.trim()) {
      showToast({ title: '请输入 API Key', icon: 'none' })
      return
    }

    storeApiKey(aiProvider, aiKey)
    this.setState({
      hasConfiguredKey: true,
      showKeyInput: false,
    })
    showToast({ title: 'API Key 已保存', icon: 'success' })
  }

  handleClearKey = () => {
    showModal({
      title: '清除 API Key',
      content: '确定要清除已配置的 API Key 吗？',
      success: (res) => {
        if (res.confirm) {
          clearApiKey()
          this.setState({
            hasConfiguredKey: false,
            aiKey: '',
            aiProvider: 'claude',
          })
          showToast({ title: '已清除', icon: 'success' })
        }
      },
    })
  }

  handleLogout = () => {
    showModal({
      title: '确认退出',
      content: '退出后需要重新登录查看星图',
      success: async (res) => {
        if (res.confirm) {
          await useUserStore.getState().logout()
          reLaunch({ url: '/pages/home/index' })
        }
      },
    })
  }

  getUserEmail(): string {
    const user = useUserStore.getState().user
    return user?.email || ''
  }

  getAvatarChar(): string {
    const { nickname } = this.state
    return nickname.charAt(0).toUpperCase()
  }

  renderUserCard() {
    const { nickname, editingNickname, editing, saving } = this.state
    const email = this.getUserEmail()

    return (
      <View className='profile__card'>
        <View className='profile__avatar'>
          <Text className='profile__avatar-text'>{this.getAvatarChar()}</Text>
        </View>

        {editing ? (
          <View className='profile__edit-area'>
            <Input
              className='profile__nickname-input'
              value={editingNickname}
              onInput={this.handleNicknameInput}
              placeholder='输入昵称'
              maxlength={20}
            />
            <View className='profile__edit-actions'>
              <Button
                className='profile__edit-btn profile__edit-btn--save'
                loading={saving}
                onClick={this.handleSaveNickname}
              >
                保存
              </Button>
              <Button
                className='profile__edit-btn profile__edit-btn--cancel'
                onClick={this.handleCancelEdit}
              >
                取消
              </Button>
            </View>
          </View>
        ) : (
          <View className='profile__user-info'>
            <View className='profile__nickname-row' onClick={this.handleStartEdit}>
              <Text className='profile__nickname'>{nickname}</Text>
              <Text className='profile__edit-icon'>✎</Text>
            </View>
            <Text className='profile__email'>{email}</Text>
          </View>
        )}
      </View>
    )
  }

  renderStats() {
    const { stats } = this.state

    return (
      <View className='profile__card profile__stats'>
        <View className='profile__stat-item'>
          <Text className='profile__stat-number'>{stats.regrets_count}</Text>
          <Text className='profile__stat-label'>发布</Text>
        </View>
        <View className='profile__stat-divider' />
        <View className='profile__stat-item'>
          <Text className='profile__stat-number'>{stats.replies_count}</Text>
          <Text className='profile__stat-label'>回应</Text>
        </View>
      </View>
    )
  }

  renderAIConfig() {
    const { hasConfiguredKey, showKeyInput, aiProvider, aiKey } = this.state

    if (showKeyInput) {
      return this.renderKeyInputForm()
    }

    return (
      <View className='profile__card profile__ai-section'>
        <Text className='profile__section-title'>AI 配置</Text>

        {hasConfiguredKey ? (
          <View className='profile__ai-status'>
            <View className='profile__ai-status-row'>
              <Text className='profile__ai-check'>✅</Text>
              <Text className='profile__ai-provider-label'>
                {AI_PROVIDERS.find(p => p.value === aiProvider)?.label || aiProvider}
              </Text>
              <Text className='profile__ai-dot'>·</Text>
              <Text className='profile__ai-masked-key'>
                {aiKey ? `${aiKey.slice(0, 8)}...${aiKey.slice(-4)}` : ''}
              </Text>
            </View>
            <View className='profile__ai-actions'>
              <Button
                className='profile__ai-btn profile__ai-btn--change'
                onClick={this.handleShowKeyInput}
              >
                更换
              </Button>
              <Button
                className='profile__ai-btn profile__ai-btn--clear'
                onClick={this.handleClearKey}
              >
                清除
              </Button>
            </View>
          </View>
        ) : (
          <Button
            className='profile__ai-add-btn'
            onClick={this.handleShowKeyInput}
          >
            + 配置 API Key
          </Button>
        )}
      </View>
    )
  }

  renderKeyInputForm() {
    const { aiProvider, aiKey } = this.state

    return (
      <View className='profile__card profile__key-form'>
        <Text className='profile__section-title'>配置 API Key</Text>

        <View className='profile__key-field'>
          <Text className='profile__key-label'>服务商</Text>
          <Picker
            mode='selector'
            range={AI_PROVIDER_LABELS}
            onChange={this.handleProviderChange}
          >
            <View className='profile__key-picker'>
              {AI_PROVIDERS.find(p => p.value === aiProvider)?.label}
            </View>
          </Picker>
        </View>

        <View className='profile__key-field'>
          <Text className='profile__key-label'>API Key</Text>
          <Input
            className='profile__key-input'
            password
            placeholder='输入 API Key'
            value={aiKey}
            onInput={this.handleKeyInput}
          />
        </View>

        <View className='profile__key-form-actions'>
          <Button
            className='profile__key-btn profile__key-btn--save'
            onClick={this.handleSaveKey}
          >
            保存
          </Button>
          <Button
            className='profile__key-btn profile__key-btn--cancel'
            onClick={this.handleHideKeyInput}
          >
            取消
          </Button>
        </View>
      </View>
    )
  }

  renderLogout() {
    return (
      <View className='profile__logout'>
        <Button className='profile__logout-btn' onClick={this.handleLogout}>
          退出登录
        </Button>
      </View>
    )
  }

  render() {
    const mode = useThemeStore.getState().mode
    return (
      <AuthGuard>
        <OceanBackground mode={mode}>
          <View className='profile'>
            <View className='profile__header'>
              <Text className='profile__title'>我的</Text>
            </View>

            {this.renderUserCard()}
            {this.renderStats()}
            {this.renderAIConfig()}
            {this.renderLogout()}

            <View className='profile__spacer' />
          </View>
        </OceanBackground>
      </AuthGuard>
    )
  }
}

export default Profile
