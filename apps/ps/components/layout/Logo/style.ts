import { css } from '@emotion/react';

export default ({ theme }) => css`
  width: ${theme.header.height};
  height: ${theme.header.height};
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  svg {
    display: inline-block;
    position: relative;
    padding: 0 1rem;
    margin: 0.5rem 0;
    line-height: ${theme.header.height};
    height: ${theme.header.height};
    position: absolute;
    left: 0.25rem;
    transform: scale(0.67);
    transform-origin: left;
  }

  a {
    color: var(--color-fg) !important;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  > * {
    font-family: var(--font-family-title);
    letter-spacing: 0.5px;
  }
`;
