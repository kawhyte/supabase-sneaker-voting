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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['undici', 'cheerio'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('re2');
    }
    return config;
  },
};

module.exports = nextConfig;