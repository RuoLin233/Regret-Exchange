const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const config = {
  projectName: 'regret-exchange',
  date: '2026-6-14',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2,
    414: 1.81,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  mini: {
    webpackChain (chain) {
      chain.resolve.plugin('TsconfigPathsPlugin').use(TsconfigPathsPlugin, [{ configFile: path.resolve(__dirname, '../tsconfig.json') }])
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 如需启用 CSS Modules，请改为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    webpackChain (chain) {
      chain.resolve.plugin('TsconfigPathsPlugin').use(TsconfigPathsPlugin, [{ configFile: path.resolve(__dirname, '../tsconfig.json') }])
    },
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false, // 如需启用 CSS Modules，请改为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  rn: {
    appName: 'regret-exchange',
    postcss: {
      cssModules: {
        enable: false, // 如需启用 CSS Modules，请改为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
