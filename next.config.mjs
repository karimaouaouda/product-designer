/** @type {import('next').NextConfig} */
const nextConfig = {
    API_END_POINT : "http://store.test/api",
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
