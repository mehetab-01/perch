import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
