import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'solidappmaker-pagecraft.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd1xyjpr3hmv834.cloudfront.net',
        port: '',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
