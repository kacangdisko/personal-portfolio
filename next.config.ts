import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Project screenshots are local files in /public/images/projects.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
