/** @type {import('next').NextConfig} */
const nextConfig = {
    'API_URL': 'https://store.test/api',
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'store.test',
            port: '',            search: '',
          },
        ],
      },
};

export default nextConfig;
