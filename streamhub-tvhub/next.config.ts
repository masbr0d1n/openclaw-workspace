import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker deployment
  reactStrictMode: true,
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:8001/api/v1/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
