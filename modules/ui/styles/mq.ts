export default {
  // by device size:
  tinyPhone: `@media (max-width: 360px)`, // Too small for almost all phones. HOWEVER, Samsung foldable phones front display is 320px wide. Also smart watches, and very old iPhone 4/5.
  smallPhone: `@media (max-width: 400px)`, // iPhone 8,X,SE,Mini = 375px, 11,12,13 Pro = 390px
  tablet: `@media (min-width: 601px) and (max-width: 1024px)`,
  largeTablet: `@media (min-width: 931px) and (max-width: 1024px)`,
  largeDesktop: `@media (min-width: 1440px)`,
  veryLargeDesktop: `@media (min-width: 1920px)`,
  // phone or larger device:
  phone: `@media (max-width: 600px)`, // most iPhones = 390-428px wide
  notPhone: `@media (min-width: 601px)`, // anything bigger than phone
  // pair desktop/mobile:
  desktop: `@media (min-width: 1025px)`,
  mobile: `@media (max-width: 1024px)`,
  // pair sm/lg:
  sm: `@media (max-width: 930px)`,
  lg: `@media (min-width: 931px)`,
  // could be useful sometimes:
  portrait: `@media (orientation: portrait)`,
  landscape: `@media (orientation: landscape)`,
  // override other media queries without resorting to "!important":
  all: `@media (min-width: 0px), (min-height: 0px)`,
  // to style by device type, OS, iframe, or WebView, use inline ss props.
  // See component props in Storybook (generated from Typescript types).
};

export const ssKeys = [
  'tinyPhone',
  'smallPhone',
  'phone',
  'notPhone',
  'tablet',
  'largeTablet',
  'largeDesktop',
  'veryLargeDesktop',
  'desktop',
  'mobile',
  'sm',
  'lg',
  'any',
  'portrait',
  'landscape',
];
export type ssKeysType = typeof ssKeys[number]; // tsFix: I don't think Typescript can actually make enum from keys or values
