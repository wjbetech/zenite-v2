import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Use remotePatterns to explicitly allow Clerk-hosted images.
    // This is more flexible and recommended in newer Next.js versions.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
