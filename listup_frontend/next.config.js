/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cloudinary.com","res.cloudinary.com","images.unsplash.com"], // ✅ Cloudinary images usually come from here
  },
  // Add trailing slash for better compatibility
  trailingSlash: false,
  // Webpack configuration to handle native modules
  webpack: (config, { isServer }) => {
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
  eslint: {
    ignoreDuringBuilds: true, // optional
  },
};

module.exports = nextConfig;
