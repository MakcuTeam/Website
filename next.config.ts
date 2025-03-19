import type { NextConfig } from "next";
import fs from 'fs'
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com/**",
      },
    ],
  },
  eslint:{
    ignoreDuringBuilds: true
  },
  // if used turbopack
  // transpilePackages: ["next-mdx-remote"],
};

export default nextConfig;
