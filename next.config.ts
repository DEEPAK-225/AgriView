import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
   experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:9002",
        "idx-studio-1746344749643-9002.asia-east1.cloudworkstations.dev",
        "idx-studio-1746344749643-6000.asia-east1.cloudworkstations.dev"
      ]
    }
  },
};

export default nextConfig;
