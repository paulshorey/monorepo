const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // https://github.com/wojtekmaj/react-pdf/issues/799
      // https://github.com/mozilla/pdf.js/issues/13373
      config.resolve.alias.canvas = false;
    }
    return config;
  },
};

// module.exports = nextConfig;
const withTM = require('next-transpile-modules')([
  '@ps/ui',
  '@ps/fn',
  '@ps/cconsole',
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
