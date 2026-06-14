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
    custom: true,
    color: '#7a8a9a',
    selectedColor: '#4a5a6a',
    list: [
      { pagePath: 'pages/home/index', text: '主页', iconPath: '', selectedIconPath: '' },
      { pagePath: 'pages/creator/index', text: '创作', iconPath: '', selectedIconPath: '' },
      { pagePath: 'pages/starmap/index', text: '星图', iconPath: '', selectedIconPath: '' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: '', selectedIconPath: '' },
    ],
  },
})
