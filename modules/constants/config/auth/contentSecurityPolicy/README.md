# Content Security Policy (CSP)

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft, to site defacement, to malware distribution.

https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

# Implementation

"To improve the security of your application, you can use headers in next.config.js to apply HTTP response headers to all routes in your application."

https://nextjs.org/docs/advanced-features/security-headers

# Usage

In `next.config.js` add a headers:

```
...config,
async headers() {
    return [
      {
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
        source: '/:path*',
      },
    ];
  },
```
