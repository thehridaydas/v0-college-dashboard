import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: false, // Disabled to avoid double-rendering in dev which doubles DB queries

  // Reduce server-side logging noise
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ["@prisma/client"],
  },
}

export default nextConfig
