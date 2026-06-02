import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/HuemanAI_Voice",
  assetPrefix: "/HuemanAI_Voice/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

