// eslint-disable-next-line import/no-commonjs
module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {},
  mini: {},
  h5: {
    /**
     * WebpackChain 插件配置
     * @docs https://github.com/neutrinojs/webpack-chain
     */
    // webpackChain (chain) {
    //   /**
    //    * 如果 h5 端编译后体积过大，可以使用 webpack-bundle-analyzer 插件对打包体积进行分析。
    //    * @docs https://github.com/webpack-contrib/webpack-bundle-analyzer
    //    */
    //   chain.plugin('analyzer', require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    //
    //   /**
    //    * 如果 h5 端首屏加载速度过慢，可使用 webpack 内置的 SplitChunksPlugin 拆包
    //    * @docs https://webpack.js.org/plugins/split-chunks-plugin/
    //    */
    //   chain.optimization.splitChunks({
    //     chunks: 'all',
    //     cacheGroups: {
    //       vendors: {
    //         name: 'vendors',
    //         test: /[\\/]node_modules[\\/]/,
    //         priority: 10,
    //         chunks: 'initial'
    //       },
    //       commons: {
    //         name: 'commons',
    //         minChunks: 3,
    //         priority: 5,
    //         reuseExistingChunk: true
    //       }
    //     }
    //   })
    // }
  }
}
