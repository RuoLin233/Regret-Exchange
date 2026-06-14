export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/creator/index',
    'pages/starmap/index',
    'pages/profile/index',
    'pages/auth/index',
  ],
  window: {
    navigationStyle: 'custom',
    backgroundColor: '#c4dde8',
  },
  tabBar: {
    custom: false,
    color: '#7a8a9a',
    selectedColor: '#4a7aaa',
    backgroundColor: '#fff8eb',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/home/index', text: '🏠 主页' },
      { pagePath: 'pages/creator/index', text: '✍️ 创作' },
      { pagePath: 'pages/starmap/index', text: '🌟 星图' },
      { pagePath: 'pages/profile/index', text: '👤 我的' },
    ],
  },
})
