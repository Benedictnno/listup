/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cloudinary.com","res.cloudinary.com","images.unsplash.com"], // ✅ Cloudinary images usually come from here
  },
  // Fix for Vercel deployment issues
  experimental: {
    // Disable lightningcss to avoid native module issues
    optimizePackageImports: ['lucide-react'],
  },
  // Webpack configuration to handle native modules
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Ensure proper output for Vercel
  output: 'standalone',
};

export default nextConfig;
