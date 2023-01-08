import styled from "@emotion/styled";

export const StyledResults = styled.div`
  font-size: 1.125rem;
  position: relative;
  padding-top: 1.25rem;
  padding-bottom: 1rem;
  color: #182026;
  min-height: 100vh;
  background: white;

  .editWordLink {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 2rem;
    color: var(--color-subtle);
    z-index: 100;
  }

  .ui-form-section {
    .one {
    }
    .two {
    }
    .three {
      text-align: center;
      cursor: pointer;
      color: var(--color-subtle);
      white-space: nowrap;
      font-size: 1.5rem;
      margin: 1rem auto -1.5rem;
      width: 5rem;
      svg {
        transform: scale(0.85);
        display: inline-block;
        top: -1rem;
        position: relative;
        background: var(--color-warmwhite);
        padding: 0;
      }
      sup {
        position: relative;
        top: -1.2rem;
      }
    }
    &.advanced {
    }
    &.simple {
      .two {
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        &:after {
          content: "";
          display: block;
          position: absolute;
          top: -0.5rem;
          right: 0;
          height: 2rem;
          width: 60px;
          background: linear-gradient(to left, var(--color-warmwhite) 0%, transparent 100%);
        }
      }
    }
  }

  .posword,
  .posword a {
    //padding: 0 0.5rem 0 0;
    display: inline-block;
    //cursor:pointer;
    font-size: 1.125rem;
    color: var(--color-medium);
  }

  .title {
    font-size: 1.25rem;
  }
`;
