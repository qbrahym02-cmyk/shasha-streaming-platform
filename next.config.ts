import type { NextConfig } from "next";

// بناء العرض الثابت (GitHub Pages / APK): BUILD_DEMO=1
const isDemo = process.env.BUILD_DEMO === "1";

const nextConfig: NextConfig = {
  ...(isDemo
    ? { output: "export" as const, images: { unoptimized: true } }
    : { output: "standalone" as const }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
