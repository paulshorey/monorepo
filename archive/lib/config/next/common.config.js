/**
 * Next.js configuration for the common app
 * Simplified version without transpilePackages since common is the package being transpiled
 */

/** @type {import('next').NextConfig} */
const commonNextConfig = {
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts"],
      ".jsx": [".jsx", ".tsx"],
    };
    return config;
  },
}

module.exports = commonNextConfig