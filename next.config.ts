import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Force clean build
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
