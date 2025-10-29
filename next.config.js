/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better dev experience
  reactStrictMode: true,

  // Strip console logs in production (keep error & warn for debugging)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.stance.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'stance.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.gap.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'oldnavy.gap.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bananarepublic.gap.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gap.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'n.nordstrommedia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.nordstrom.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'beistravel.com',
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