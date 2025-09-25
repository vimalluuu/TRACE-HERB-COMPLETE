// Next.js configuration optimized for FREE hosting
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',
  trailingSlash: true,
  
  // Optimize for free tier limits
  experimental: {
    // Reduce memory usage
    workerThreads: false,
    // Optimize bundle size
    optimizeCss: true,
  },
  
  // Image optimization (disabled for static export)
  images: {
    unoptimized: true,
  },
  
  // Compress output
  compress: true,
  
  // Environment variables for free hosting
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://trace-herb-backend.railway.app',
    NEXT_PUBLIC_HOSTING_MODE: 'free',
  },
  
  // Webpack optimization for smaller bundles
  webpack: (config, { isServer }) => {
    // Reduce bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    
    // Tree shaking
    config.optimization.usedExports = true;
    
    return config;
  },
  
  // Disable source maps in production to reduce size
  productionBrowserSourceMaps: false,
  
  // Optimize for Vercel/Netlify
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
