/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.assembly.go.kr',
        pathname: '/static/portal/img/openassm/**',
      },
    ],
  },
};

module.exports = nextConfig; 