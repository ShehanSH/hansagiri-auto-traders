import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/inventory", destination: "/vehicles", permanent: true },
      { source: "/inventory/:slug", destination: "/vehicles/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
