import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://i-love-dog-api.girsa.ru/api/v1';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "tailo.org" }],
        destination: "https://me.tailo.org/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tailo.org" }],
        destination: "https://me.tailo.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
