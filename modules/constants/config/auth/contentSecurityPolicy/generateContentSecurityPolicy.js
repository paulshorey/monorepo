/*
 * THIS FILE IS NOT USED - NEEDS UPDATE DOMAINS AND TESTING
 */
const { googleDomains } = require('./googleDomains');

const generateContentSecurityPolicy = () => {
  let csp = ``;
  csp += `base-uri 'self';`;
  csp += `form-action 'self' https://www.facebook.com;`;
  csp += `default-src 'self' *.*.* localhost:*;`;
  /**
   * NextJS requires 'unsafe-eval' in dev + Smartlook requires in prod
   */
  csp += `script-src 'self' 'unsafe-eval' *.*.* localhost:* ${googleDomains}`;
  /**
   * NextJS requires 'unsafe-inline'
   */
  csp += `style-src 'self' 'unsafe-inline';`;
  csp += `img-src 'self' data: *.*.* localhost:* blob: ${googleDomains};`;
  csp += `font-src 'self';`;
  /**
   * @TODO - will have to add production url for tabapay when available or the iframe will be blocked.
   */
  csp += `frame-src *.*.* localhost:*;`;
  csp += `frame-ancestors 'self';`;
  /**
   * @TODO - media should come from self, cloudinary, guidestar, or authorized providers.
   */
  csp += `media-src *;`;
  csp += `child-src blob: *.getpinwheel.com *.plaid.com;`;
  csp += `connect-src blob: ws: *.*.* localhost:*`;
  csp += `object-src 'none';`;

  return csp;
};

module.exports = { generateContentSecurityPolicy };
