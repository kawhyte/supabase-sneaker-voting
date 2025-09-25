/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.soleretriever.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;