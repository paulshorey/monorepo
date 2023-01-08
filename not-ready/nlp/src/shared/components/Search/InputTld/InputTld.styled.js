import styled from "@emotion/styled";

export const Styled = styled.div`
  &.InputTld {
    position: relative;
    cursor: pointer;
    width: 6.44rem;
    min-width: 6.44rem;
    &::before {
      content: ".";
      position: absolute;
      left: 0.5rem;
      font-weight: 700;
      line-height: 2.33rem;
      height: 100%;
      color: var(--color-attention);
      font-size: 1.25rem;
    }
    input {
      background: none;
      padding-left: 1rem;
      color: var(--color-attention);
      font-size: 1.5rem;
      border: none;
      padding-bottom: 0.52rem;
    }
    .caret {
      content: ".";
      position: absolute;
      right: 1rem;
      top: 0.075rem;
      font-size: 2rem;
      font-weight: 900;
      line-height: 2.2rem;
      height: 100%;
      color: var(--color-attention);
      pointer-events: none;
      cursor: pointer;
    }
  }
`;
