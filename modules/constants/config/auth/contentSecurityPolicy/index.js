const {
  generateContentSecurityPolicy,
} = require('./generateContentSecurityPolicy');

const ContentSecurityPolicy = generateContentSecurityPolicy();

module.exports = ContentSecurityPolicy;
