import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
