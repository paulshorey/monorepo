import styled from "@emotion/styled";

export const WordPossStyled = styled.div`
  position: relative;
  z-index: 10;
  background: hsl(216, 38%, 88%);
  transition: max-height linear 0.5s;
  overflow: auto;
  font-weight: 400;
  &.hide {
    height: 0;
  }
  > .columns {
    padding: 0.5rem;
  }
  .column {
    margin: 0.5rem 0.25rem 0;
    &:first-child {
    }
    &:last-child {
      margin-right: 0.75rem;
    }
  }
  a {
    color: var(--color-link);
  }
  h5 {
    color: var(--color-light);
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-size: 0.83em;
  }
  .color-link.clickable {
    white-space: nowrap;
  }
  .object {
    font-size: 0.83em;
  }
  .words {
    .PosWordStyled {
      padding-left: 0.25rem;
      .posword,
      .posword a {
        font-weight: 400;
        color: var(--color-primary-dark);
        .plusMinus {
          color: var(--color-primary);
        }
      }
    }
  }
  .pos_inputgroup {
    zoom: 0.75;
    padding-bottom: 0.33rem;
  }
`;
