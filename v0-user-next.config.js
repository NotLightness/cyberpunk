/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "cyberpunk-hacker-platform.vercel.app"],
  },
}

module.exports = nextConfig

