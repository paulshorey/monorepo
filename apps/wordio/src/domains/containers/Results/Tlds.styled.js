import styled from "@emotion/styled";

export const TldsStyled = styled.div`
  white-space: nowrap;
  padding-right: 0.25rem;
  min-width: 10.5rem;
  margin-left: 0.25rem;
  .section {
    margin: 0 0 1.25rem;
  }
  h5 {
    margin: 0.25rem 0 0.25rem;
    .topN {
      cursor: pointer;
      svg {
        transform: scale(0.85) translate(0.5px, 0.5px);
        //transform: scale(1.125 1.25) translate(-0.5px, 0.5px);
        //padding-right: 0.1rem;
      }
    }
    &.unchecked {
      margin-top: 1.25rem;
    }
  }
  .info {
    display: none;
    color: var(--color-accent);
    font-weight: 600;
    font-size: 0.75rem;
    line-height: 1rem;
    text-align: right;
    margin-top: -0.25rem;
    position: absolute;
    right: 1.75rem;
    svg {
      transform: scale(1.125, 0.9);
    }
  }

  /* 
   * tlds
   */
  .tld_line {
    margin: 0.25rem 0 0.25rem 0;
    color: var(--color-dark);
    position: relative;
    &.select svg {
      color: var(--color-attention);
      margin-left: 0.11rem;
      text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.25);
    }
    .fa-times {
      cursor: pointer;
      transform: scale(0.9);
      color: var(--color-bad-light);
      margin-left: 0.44rem;
      text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.25);
    }
    .fa-heart {
      cursor: pointer;
      color: var(--color-attention);
      transform: scale(0.75) translate(0, 1px);
      margin-right: 0.22rem;
      opacity: 0.9;
    }
    b {
      font-weight: 900;
    }
    &.unchecked {
      color: var(--color-medium);
    }
  }

  /*
   * components
   */
  .fa-angle-down {
    cursor: pointer;
    transform: scale(1) translate(0.3rem, 0.05rem);
  }
`;
