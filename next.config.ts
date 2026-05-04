import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
   reactStrictMode: true,
  images: {
    qualities: [75, 80, 90, 100],

    // Device breakpoints (tuned for most apps)
    deviceSizes: [320, 420, 768, 1024, 1200, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],

    // Cache optimized images at the edge
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  poweredByHeader: false,
};

export default nextConfig;
