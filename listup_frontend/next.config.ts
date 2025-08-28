/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cloudinary.com","res.cloudinary.com","images.unsplash.com"], // ✅ Cloudinary images usually come from here
  },
  // Ensure proper output for Vercel
  output: 'standalone',
  // Add trailing slash for better compatibility
  trailingSlash: false,
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
};

export default nextConfig;
