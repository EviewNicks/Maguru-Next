/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'another-domain.com',
        port: '',
        pathname: '/**',
      },
    ],
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

  // Konfigurasi Turbopack terbaru
  turbopack: {
    // Menentukan root direktori aplikasi (opsional)
    root: path.join(__dirname),
    // Konfigurasi loader untuk file-file khusus (opsional)
    rules: {
      // Contoh: menggunakan @svgr/webpack untuk file SVG
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    // Konfigurasi resolveAlias untuk alias path (opsional)
    resolveAlias: {
      // contoh: '@components': path.join(__dirname, 'components'),
    },
    // Konfigurasi ekstensi file yang didukung (opsional)
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.mdx'],
  },

  // Pindahkan dari experimental ke root level sesuai pesan error
  serverExternalPackages: ['@sentry/node'],

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

    // Perbaiki konfigurasi cache dengan path absolut
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.join(__dirname, '.next/cache'), // Gunakan path absolut
    }

    return config
  },
}

// Aplikasikan bundle analyzer
const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)

// Aplikasikan konfigurasi Sentry
export default withSentryConfig(
  withSentryConfig(withBundleAnalyzerConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: 'maguru',
    project: 'javascript-nextjs',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }),
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: 'maguru',
    project: 'javascript-nextjs',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
)
