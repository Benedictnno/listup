/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
