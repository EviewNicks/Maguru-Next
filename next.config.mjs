/** @type {import('next').NextConfig} */
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
  staticPageGenerationTimeout: 0,

  // Enable dynamic rendering
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  devvIndicators: false,

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

  output: 'standalone',
}

export default nextConfig
