/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
  rewrites() {
    const notakuDocsUrlWithBasePath = new URL(
      `https://7773f212-60d9-41b1.docs-base-path.notaku.site`
    ).origin;
    return [
      {
        source: '/api',
        destination: `https://documenter.getpostman.com/view/23360867/2s8YzXtewC`,
      },
      {
        source: '/docs',
        destination: `${notakuDocsUrlWithBasePath}/docs`,
      },
      {
        source: '/docs/:path*',
        destination: `${notakuDocsUrlWithBasePath}/docs/:path*`,
      },
    ];
  },
};

// module.exports = nextConfig;
const withTM = require('next-transpile-modules')([
  '@techytools/ui',
  '@techytools/fn',
  '@techytools/cc',
  '@ps/constants',
]);

module.exports = withTM(nextConfig);

// const dotenvLoad = require('dotenv-load');
// const nextBuildId = require('next-build-id');

// // const ContentSecurityPolicy = require('@ps/constants/config/auth/contentSecurityPolicy/index');

// dotenvLoad();

// module.exports = withTM({
//   env: {
//     MIXPANEL_ID: process.env.MIXPANEL_ID,
//   },
//   generateBuildId: () => nextBuildId({ describe: true, dir: __dirname }),
//   async headers() {
//     return [
//       {
//         headers: [
//           /**
//            * Content Security Policy - apply to all routes.
//            */
//           // {
//           //   key: 'Content-Security-Policy',
//           //   value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
//           // },
//           /**
//            * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
//            */
//           {
//             key: 'Strict-Transport-Security',
//             value: 'max-age=3600; includeSubDomains; preload',
//           },
//         ],
//         source: '/:path*',
//       },
//     ];
//   },
