import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  api: {
    responseLimit: false,
  },
  output: 'standalone',
};

export default nextConfig;
