import { css } from '@emotion/react';

export default ({ theme }) => css`
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem 1rem;
  background-color: transparent;
  backdrop-filter: blur(10px);
  a {
    display: block;
    padding: 0.25rem 0.5rem;
    margin: 0;
  }
  .Button {
    padding: 0 0.5rem;
    > span {
      font-size: 1.125rem;
    }
  }
  > * {
    align-self: flex-end;
    text-align: right;
    margin: 0.25rem 0;
    display: block;
  }
`;
