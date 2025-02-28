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
}

export default nextConfig
