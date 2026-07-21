/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cyyndwixcdxntedsxlpe.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ],
  },

  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'https://cyyndwixcdxntedsxlpe.supabase.co/storage/v1/object/public/porto-ibnughaotz-tzy/:path*',
      },
    ]
  },

  allowedDevOrigins: [
    'http://localhost:3000',
    'http://[IP_ADDRESS]',
    '192.168.8.12',
    'http://[IP_ADDRESS]',
    'https://25a14140-c848-48e0-8fa5-63d1c5a972df.loca.lt',
  ],
};

export default nextConfig;
