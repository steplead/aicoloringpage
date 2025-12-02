import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias['@google/generative-ai'] = false;
    return config;
  },
};

export default nextConfig;
