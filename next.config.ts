/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Force cache bypass by adding a dummy build id
    unoptimized: false,
  },
  // Adding a unique build ID to force a clean slate on Vercel
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
