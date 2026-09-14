import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV ?? "",
  },
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
