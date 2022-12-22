import { css } from '@emotion/react';

export const contentWidthFull = (theme) => css`

  width: auto;
  max-width: ${1178}px;
  margin-left: 0;
  margin-right: 0;
  padding-left: 30px;
  padding-right: 30px;

  @media (max-width: ${700}px) {
	margin-left: 0;
	margin-right: 0;
	padding-left: 20px;
	padding-right: 20px;
  }

`;
