/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['localhost', 'api.mapbox.com'],
    unoptimized: true
  },
  experimental: {
    appDir: false
  },
  webpack: (config, { isServer }) => {
    // Handle canvas for jsPDF
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      }
    }
    return config
  },
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoidHJhY2UtaGVyYiIsImEiOiJjbHh4eHh4eHgwMDAwM2xxbzAwMDBvMDAwIn0.demo-token',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3000'
  }
}

module.exports = withPWA(nextConfig)
