import styled from "@emotion/styled";

export const PosWordStyled = styled.span`
  padding: 0 0 0 0.6rem;
  .posword {
    margin: 0 -0.1rem 0 0;
    display: inline-block;
    cursor: pointer;
  }
  .posword,
  .posword a {
    color: var(--color-medium);
    > span:hover {
      color: var(--color-link);
    }
  }
  .posword_sentiment {
    padding: 0 0 0 0.125rem;
    display: inline-block;
    color: var(--color-medium);
    &:hover {
      color: var(--color-link);
    }
    sup.plusMinus {
      user-select: none;
      &.plus {
        color: var(--color-accent);
      }
      &.minus {
        color: var(--color-bad-light);
      }
      b {
        cursor: pointer;
        position: relative;
        top: -5px;
        margin-bottom: 10px;
      }
      &:hover {
        color: red;
      }
    }
    sup.deleteWord {
      opacity: 0.67;
      user-select: none;
      margin-left: 3px;
      transform: scale(1.2);
      b {
        cursor: pointer;
        position: relative;
        top: -3px;
        margin-bottom: 7px;
      }
      color: var(--color-bad-dark);
      &:hover {
        color: red;
      }
    }
  }
`;
