const NGROK_URL = process.env.NEXT_PUBLIC_NGROK_URL;

const nextConfig = {
  images: {
    remotePatterns: NGROK_URL
        ? [
            {
              protocol: 'https',
              hostname: NGROK_URL.replace(/^https?:\/\//, ''),
              pathname: '/media/**',
            },
          ]
        : [],
  },
};

module.exports = nextConfig;

