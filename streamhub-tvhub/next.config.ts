import type { NextConfig } from "next";
import analyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker deployment
  reactStrictMode: true,
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/api/v1/:path*',
          // Use environment variable for backend URL, fallback to localhost
          destination: `${process.env.BACKEND_API_URL || 'http://localhost:8001'}/api/v1/:path*`,
        },
      ],
    };
  },
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
};

export default withBundleAnalyzer(nextConfig);
