/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src', 'pages', 'components', 'lib', 'app'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable stricter build checks
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Enable more detailed error reporting
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    // Ignore HTML files
    config.module.rules.push({
      test: /\.html$/,
      loader: 'ignore-loader',
    });
    
    if (isServer) {
      config.externals.push('canvas');
    }
    return config;
  },
  // Help prevent connection refused errors by configuring server options
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Security headers to prevent access to sensitive files
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: isDev ? 'SAMEORIGIN' : 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Add cache-busting for development
          ...(isDev ? [{
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          }] : []),
        ],
      },
      {
        // Ensure favicon is cacheable and simple
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Allow html-tools to be framed for proper display
        source: '/html-tools/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Add aggressive cache-busting for HTML tools in development
          ...(isDev ? [{
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, no-transform',
          }, {
            key: 'Pragma',
            value: 'no-cache',
          }, {
            key: 'Expires',
            value: '0',
          }] : []),
        ],
      },
      {
        // Allow HTML files in public root to be framed for sideblocks
        source: '/:path*.html',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // Block access to sensitive files
        source: '/.git/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/.env',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;