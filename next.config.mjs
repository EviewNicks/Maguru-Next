/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'img.clerk.com' }],
  },
  reactStrictMode: false,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  // Enable SWC compiler
  swcMinify: true,

  // Experimental features
  experimental: {
    // Enable server components
    serverComponents: true,
    // Enable app directory
    appDir: true,
  },

  // Configure webpack if needed
  webpack: (config, { isServer }) => {
    // Custom webpack config here
    return config
  },
}

export default nextConfig
