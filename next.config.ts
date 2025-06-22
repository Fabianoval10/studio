import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/create-report',
        destination: '/',
        permanent: true,
      },
      {
        source: '/reports',
        destination: '/',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/',
        permanent: true,
      },
    ];
  },
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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
