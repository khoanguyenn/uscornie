import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: "/spaces/:path*",
        destination: `${backendUrl}/spaces/:path*`,
      },
      {
        source: "/invites/:path*",
        destination: `${backendUrl}/invites/:path*`,
      },
    ];
  },
};

export default nextConfig;
