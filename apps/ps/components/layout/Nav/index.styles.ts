import { css } from '@emotion/react';

export default ({ theme }) => css`
  display: flex;
  margin: 1rem 0.1rem 0.9rem 1rem;
  > * {
    line-height: calc(${theme.header.height} - 2rem);
    display: inline-flex;
    margin-right: 1rem;
  }
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  .Dropdown {
    .Dropdown__menuContainer {
      margin-top: 0;
      margin-left: -1.25rem;
      margin-right: -1.25rem;
    }
    ${theme.mq.phone} {
      .Dropdown__menuContainer {
        position: fixed !important;
        right: 0 !important;
        width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        text-align: center;
      }
    }
  }
`;
