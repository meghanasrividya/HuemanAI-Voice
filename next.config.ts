import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://voice.huemanai.co.uk/api/:path*",
      },
    ];
  },
};

export default nextConfig;

