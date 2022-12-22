import { css } from '@emotion/react';

export default (theme) => css`
  html {
	font-size: 20px;
	@media (max-width: 2000px) {
	  font-size: 18px;
	}
	@media (max-width: 1200px) {
	  font-size: 16px;
	}
	@media (max-width: 800px) {
	  font-size: 14px;
	}
	@media (max-width: 600px) {
	  font-size: 12px;
	}
  }

  body {
	font-family: 'Roboto', Helvetica, sans-serif;
	padding: 0;
	margin: 0;
	color: #000;
	font-size: 18px;
	line-height: 1.5;
	min-width: 375px;
	font-weight: 400;
	background: #F3EEE8;

	${theme.breakpoints.xsmall.max} {
	  padding-top: 3px;
	  font-size: 16px;
	}
  }

  button {
	font-family: 'Roboto', Helvetica, sans-serif;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  blockquote {
	font-family: 'Roboto', Helvetica, sans-serif;
	margin: 1.33em 0 0.33em 0;
	line-height: 1.33 !important;
	padding: 0;

	&,
	a {
	  color: #333;
	}
  }

  blockquote {
	margin: 0.67em 0;
  }

  b,
  strong {
	font-weight: 500;
  }

  h1, h2, h3, h4, h5, h6 {
	font-weight: 300;

	${theme.breakpoints.small.max} {
	  font-weight: 400;
	}

	${theme.breakpoints.xsmall.max} {
	  font-weight: 500;
	}
  }

  h1,
  h2 {
	font-size: 2rem;
  }

  h3,
  h4 {
	font-size: 1.5rem;
  }

  h5,
  h6 {
	font-size: 1rem;
  }

  blockquote {
	border-left: solid 4px #ccc;
	padding: 8px 0 8px 16px;
	font-size: 22px;

	${theme.breakpoints.xsmall.max} {
	  font-size: 18px;
	}
  }

  figure {
	margin: 0;
  }

  p {
	font-weight: 400;
	margin: 0;
	padding: 10px 0;
  }

  a {
	color: ${theme.colors.link};
	text-decoration: none;

	&:hover {
	  color: ${theme.colors.link};
	  text-decoration: underline;
	}
  }

  article {
	a {
	  text-decoration: underline;

	  &:hover {
		text-decoration: underline;
	  }
	}
  }

  sup {
	font-size: 50%;
	padding: 0 0 0 4px;
  }

  table {
	border-spacing: 0;
	border-collapse: separate;

	td:not(:last-child),
	th:not(:last-child) {
	  border-right: none !important;
	}

	tr:not(:last-child) td,
	tr:not(:last-child) th {
	  border-bottom: none !important;
	}
  }

  .table {
	display: flex;
	flex-direction: column;

	.tr {
	  display: flex;
	  width: 100%;
	  justify-content: center;

	  .td,
	  .th {
		width: 100%;
	  }
	}

	.td:not(:last-child),
	.th:not(:last-child) {
	  border-right: none !important;
	}

	.tr:not(:last-child) .td,
	.tr:not(:last-child) .th {
	  border-bottom: none !important;
	}

	.td:first-child,
	.th:first-child {
	  border-left: none !important;
	}

	.td:last-child,
	.th:last-child {
	  border-right: none !important;
	}

	.tr:first-child .td,
	.tr:first-child .th {
	  border-top: none !important;
	}

	.tr:last-child .td,
	.tr:last-child .th {
	  border-bottom: none !important;
	}
  }
`;
