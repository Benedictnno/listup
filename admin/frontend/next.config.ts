import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configure for both Turbopack and webpack
  experimental: {
    turbo: {
      resolveAlias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
  // Fallback webpack config for when not using Turbopack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
