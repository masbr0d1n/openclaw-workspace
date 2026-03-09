import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker deployment
  reactStrictMode: true,
  async rewrites() {
    // Use environment variable for backend URL, fallback to localhost for development
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001';
    
    return {
      afterFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl}/api/v1/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
