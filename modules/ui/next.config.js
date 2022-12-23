const withTM = require('next-transpile-modules')(['@techytools/fn']);
const dotenvLoad = require('dotenv-load');
const nextBuildId = require('next-build-id');

// const ContentSecurityPolicy = require('@ps/constants/config/auth/contentSecurityPolicy/index');

dotenvLoad();

module.exports = withTM({
  env: {
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
  },
  generateBuildId: () => nextBuildId({ describe: true, dir: __dirname }),
  async headers() {
    return [
      {
        headers: [
          /**
           * Content Security Policy - apply to all routes.
           */
          // {
          //   key: 'Content-Security-Policy',
          //   value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          // },
          /**
           * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
           */
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=3600; includeSubDomains; preload',
          },
        ],
        source: '/:path*',
      },
    ];
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // https://github.com/wojtekmaj/react-pdf/issues/799
      // https://github.com/mozilla/pdf.js/issues/13373
      config.resolve.alias.canvas = false;
    }

    config.module.rules.push({
      test: /\.md$/,
      use: ['raw-loader'],
    });

    // config.module.rules.push({
    //   test: /\.svg$/i,
    //   issuer: /\.[jt]sx?$/,
    //   use: ['@svgr/webpack'],
    // });

    return config;
  },
});
