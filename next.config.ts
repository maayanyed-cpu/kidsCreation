import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow larger bodies for artwork uploads (images can be 20+ MB before resize)
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
