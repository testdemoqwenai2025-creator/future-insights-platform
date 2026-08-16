/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/DemoSciCMP",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
