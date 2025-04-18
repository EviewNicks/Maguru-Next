/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer'
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'img.clerk.com' }],
    domains: ['img.clerk.com'],
  },
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },

  // Disable static optimization for all pages
  staticPageGenerationTimeout: 180,

  // Tetap pertahankan konfigurasi tracing untuk keamanan
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    '*': ['./app/**/*', './components/**/*', './lib/**/*', './prisma/**/*'],
  },
  outputFileTracingExcludes: {
    '*': [
      '**/Cookies/**',
      '**/Local Settings/**',
      '**/Application Data/**',
      '**/My Documents/**',
      '**/NetHood/**',
      '**/PrintHood/**',
      '**/Recent/**',
      '**/SendTo/**',
      '**/Templates/**',
      '**/Start Menu/**',
      '**/AppData/**',
      '**/Temporary Internet Files/**',
      '**/WinSxS/**',
      '**/Windows/**',
      '**/ProgramData/**',
      '**/Program Files/**',
      '**/Program Files (x86)/**',
      '**/WindowsApps/**',
      '**/Microsoft/**',
    ],
  },

  // Enable dynamic rendering
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  devIndicators: false,

  // Disable some ESLint rules for tests
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configure dynamic routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-custom-header',
            value: 'my custom header value',
          },
        ],
      },
    ]
  },

  // Perbarui konfigurasi webpack
  webpack: (config, { isServer }) => {
    // Tambahkan PrismaPlugin jika pada server build
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    // Konfigurasi watchOptions yang sudah ada tetap dipertahankan
    const originalIgnored = Array.isArray(config.watchOptions?.ignored)
      ? config.watchOptions?.ignored
      : []

    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...originalIgnored,
        '**/Cookies/**',
        '**/Local Settings/**',
        '**/Application Data/**',
        '**/My Documents/**',
        '**/NetHood/**',
        '**/PrintHood/**',
        '**/Recent/**',
        '**/SendTo/**',
        '**/Templates/**',
        '**/Start Menu/**',
        '**/AppData/**',
        '**/WindowsApps/**',
        '**/AppData/Local/Microsoft/**',
      ],
    }

    return config
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
