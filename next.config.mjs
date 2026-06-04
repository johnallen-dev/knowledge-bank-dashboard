/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'xlsx', 'mammoth'],
  },
}

export default nextConfig
