/** @type {import('next').NextConfig} */
const nextConfig = {};

// module.exports = nextConfig;
const withTM = require("next-transpile-modules")(["@techytools/ui", "@techytools/fn", "@techytools/cc", "@techytools/constants"]);

module.exports = withTM(nextConfig);
