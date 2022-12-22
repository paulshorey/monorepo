import { css } from '@emotion/react';

export default (theme) => css`

  //@font-face {
	//font-family: 'Roboto';
	//src: url('/fonts/Roboto/Roboto-Thin.ttf') format('truetype');
	//font-display: swap;
	//font-weight: 100;
  //}
  @font-face {
	font-family: 'Roboto';
	src: url('/fonts/Roboto/Roboto-Light.ttf') format('truetype');
	font-display: swap;
	font-weight: 300;
  }
  @font-face {
	font-family: 'Roboto';
	src: url('/fonts/Roboto/Roboto-Regular.ttf') format('truetype');
	font-display: swap;
	font-weight: 400;
  }
  @font-face {
	font-family: 'Roboto';
	src: url('/fonts/Roboto/Roboto-Medium.ttf') format('truetype');
	font-display: swap;
	font-weight: 500;
  }
  @font-face {
	font-family: 'Roboto';
	src: url('/fonts/Roboto/Roboto-Bold.ttf') format('truetype');
	font-display: swap;
	font-weight: 600;
  }
  //@font-face {
	//font-family: 'Roboto';
	//src: url('/fonts/Roboto/Roboto-Black.ttf') format('truetype');
	//font-display: swap;
	//font-weight: 900;
  //}
`;
