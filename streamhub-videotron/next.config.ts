import type { NextConfig } from "next";
import analyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker deployment
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // REMOVED: Rewrites bypass API routes and don't forward Set-Cookie headers
  // All API calls now go through Next.js API routes (src/app/api/v1/*)
  // which properly forward cookies from backend responses
};

export default withBundleAnalyzer(nextConfig);
