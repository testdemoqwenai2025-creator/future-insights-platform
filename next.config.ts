import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/DemoSciCMP",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Disable Turbopack to fix lightningcss native module issue
  experimental: {},
};

export default nextConfig;
