import type { NextConfig } from "next";

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
};

export default nextConfig;
