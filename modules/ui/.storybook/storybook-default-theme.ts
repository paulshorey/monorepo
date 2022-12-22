var colors = {
  // primary: '#FF4785',
  // secondary: '#1EA7FD',
  // Official color palette
  primary: 'hsl(245deg 55% 55%)',
  secondary: 'hsl(245deg 55% 55%)', // '#715fe4',
  tertiary: '#FAFBFC',
  ancillary: '#22a699',
  // Complimentary
  orange: '#FC521F',
  gold: '#FFAE00',
  green: '#66BF3C',
  seafoam: '#37D5D3',
  purple: '#6F2CAC',
  ultraviolet: '#2A0481',
  // Monochrome
  lightest: '#FFFFFF',
  lighter: '#F8F8F8',
  light: '#F3F3F3',
  mediumlight: '#EEEEEE',
  medium: '#DDDDDD',
  mediumdark: '#999999',
  dark: '#666666',
  darker: '#444444',
  darkest: '#333333',
  // For borders
  border: 'rgba(0,0,0,.1)',
  // Status
  positive: '#66BF3C',
  negative: '#FF4400',
  warning: '#E69D00',
  critical: '#FFFFFF',
  defaultText: '#333333',
  inverseText: '#FFFFFF',
};
var typography = {
  fonts: {
    base: [
      '"Nunito Sans"',
      '-apple-system',
      '".SFNSText-Regular"',
      '"San Francisco"',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(', '),
    mono: [
      'ui-monospace',
      'Menlo',
      'Monaco',
      '"Roboto Mono"',
      '"Oxygen Mono"',
      '"Ubuntu Monospace"',
      '"Source Code Pro"',
      '"Droid Sans Mono"',
      '"Courier New"',
      'monospace',
    ].join(', '),
  },
  weight: {
    regular: 400,
    bold: 700,
    black: 900,
  },
  size: {
    s1: 12,
    s2: 14,
    s3: 16,
    m1: 20,
    m2: 24,
    m3: 28,
    l1: 32,
    l2: 40,
    l3: 48,
    code: 90,
  },
};

const theme = {
  key: 'default',
  title: 'Default',

  colorsKey: 'dark',
  i18n: { locale: 'en-US' },

  colors,
  // Storybook-specific color palette
  colorPrimary: colors.primary,
  colorSecondary: colors.secondary,

  // Typography
  fontBase: typography.fonts.base,
  fontCode: typography.fonts.mono,

  base: 'dark',
  brandTitle: 'Harmony UI',
  brandUrl: '/',
  // brandImage: 'https://place-hold.it/350x150',
  brandTarget: '_top',

  //
  // UI
  appBg: '#2f2f2f',
  appContentBg: colors.darkest,
  appBorderColor: 'rgba(255,255,255,.1)',
  appBorderRadius: 4,
  // Text colors
  textcolor: colors.lightest,
  textInverseColor: colors.darkest,
  textMutedColor: colors.mediumdark,
  // Toolbar default and active colors
  barTextColor: '#999999',
  barSelectedColor: colors.secondary,
  barBg: colors.darkest,
  // Form colors
  inputBg: '#3f3f3f',
  inputBorder: 'rgba(0,0,0,.3)',
  inputTextColor: colors.lightest,
  inputBorderRadius: 4,
};

export default theme;
