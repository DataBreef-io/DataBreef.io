import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output enables clean Docker multi-stage builds.
  // See docker/app.Dockerfile for usage.
  output: "standalone",

  // Transpile shared monorepo packages
  transpilePackages: ["@databreef/tokens", "@databreef/ui"],

  // Strict TypeScript build settings
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
