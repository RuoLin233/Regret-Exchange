// eslint-disable-next-line import/no-commonjs
module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    'process.env.TARO_APP_SUPABASE_URL': JSON.stringify('https://yndsqtpglkncrbjzqrkd.supabase.co'),
    'process.env.TARO_APP_SUPABASE_ANON_KEY': JSON.stringify('sb_publishable_TGOgp_Czz9XdixUsKG-_cw_rwe__kvK')
  },
  mini: {},
  h5: {
    devServer: {
      client: {
        overlay: false
      }
    }
  }
}
