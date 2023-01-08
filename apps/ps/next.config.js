/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
};

// module.exports = nextConfig;
const withTM = require('next-transpile-modules')([
  '@techytools/ui',
  '@techytools/fn',
  '@techytools/cc',
  '@techytools/constants',
]);

module.exports = withTM(nextConfig);
