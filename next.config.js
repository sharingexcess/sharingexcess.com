/** @type {import('next').NextConfig} */
const path = require('path') // eslint-disable-line

module.exports = {
  // assetPrefix: './',
  reactStrictMode: false,
  webpack: (config, { defaultLoaders }) => {
    if (process.env.NODE_ENV === 'development') {
      config.resolve.alias = {
        ...config.resolve.alias,
      }
      config.module.rules.push({
        test: /\.(ts|tsx)$/,
        include: [path.resolve(__dirname, '../designsystem/src/')],
        use: [defaultLoaders.babel],
      })
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
