import { css } from '@emotion/react';

const fonts = (theme) => css`
  @font-face {
    font-family: 'HelveticaNeue';
    src: url('/fonts/HelveticaNeue300.ttf') format('truetype');
    font-display: swap;
    font-weight: 300;
  }
  @font-face {
    font-family: 'HelveticaNeue';
    src: url('/fonts/HelveticaNeue400.ttf') format('truetype');
    font-display: swap;
    font-weight: 400;
  }
  @font-face {
    font-family: 'HelveticaNeue';
    src: url('/fonts/HelveticaNeue500.ttf') format('truetype');
    font-display: swap;
    font-weight: 500;
  }
  @font-face {
    font-family: 'HelveticaNeue';
    src: url('/fonts/HelveticaNeue700.ttf') format('truetype');
    font-display: swap;
    font-weight: 700;
  }

  @font-face {
    font-family: 'greycliff';
    src: url('/fonts/greycliff/GreycliffCF-Light.woff2') format('woff2');
    font-display: swap;
    font-weight: 300;
  }
  @font-face {
    font-family: 'greycliff';
    src: url('/fonts/greycliff/GreycliffCF-Regular.woff2') format('woff2');
    font-display: swap;
    font-weight: 400;
  }
  @font-face {
    font-family: 'greycliff';
    src: url('/fonts/greycliff/GreycliffCF-Medium.woff2') format('woff2');
    font-display: swap;
    font-weight: 500;
  }
  @font-face {
    font-family: 'greycliff';
    src: url('/fonts/greycliff/GreycliffCF-DemiBold.woff2') format('woff2');
    font-display: swap;
    font-weight: 600;
  }
  @font-face {
    font-family: 'greycliff';
    src: url('/fonts/greycliff/GreycliffCF-Bold.woff2') format('woff2');
    font-display: swap;
    font-weight: 800;
  }
`;

export default fonts;
