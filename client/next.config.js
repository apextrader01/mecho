/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*'
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*'
      },
      {
        source: '/vendor',
        destination: 'http://localhost:3001/vendor'
      },
      {
        source: '/vendor/:path*',
        destination: 'http://localhost:3001/vendor/:path*'
      },
      {
        source: '/admin',
        destination: 'http://localhost:3002/admin'
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:3002/admin/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
