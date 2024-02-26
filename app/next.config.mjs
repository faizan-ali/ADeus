/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
