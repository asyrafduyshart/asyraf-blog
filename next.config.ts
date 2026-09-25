import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't regenerate AGENTS.md / CLAUDE.md boilerplate on `next dev`.
  agentRules: false,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
