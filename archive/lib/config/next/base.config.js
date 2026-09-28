/**
 * Base Next.js configuration shared across all apps
 * Apps can extend this by spreading the config and overriding specific properties
 */

/** @type {import('next').NextConfig} */
const baseNextConfig = {
  transpilePackages: ["@lib/common"],
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

module.exports = baseNextConfig;
