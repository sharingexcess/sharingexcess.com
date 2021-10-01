/** @type {import('next').NextConfig} */
const path = require('path') // eslint-disable-line

module.exports = {
  assetPrefix: './',
  reactStrictMode: false,
  webpack: (config, { defaultLoaders }) => {
    if (process.env.NODE_ENV === 'development') {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sharingexcess/designsystem': path.resolve('../designsystem/src'),
        '@sharingexcess/designsystem/build/index.scss': path.resolve(
          '../designsystem/src'
        ),
      }
      config.module.rules.push({
        test: /\.(ts|tsx)$/,
        include: [path.resolve(__dirname, '../designsystem/src/')],
        use: [defaultLoaders.babel],
      })
    }
    return config
  },
}
