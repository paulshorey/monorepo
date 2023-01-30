import styled from "@emotion/styled";

export const LegendStyled = styled.div`
  .LinkToToggleOptionsStyled {
    color: var(--color-light);
  }

  h5 {
    display: inline;
    padding-right: 0.67rem;
  }

  .label {
    font-size: 0.75rem;
    margin: 0 0.75rem 0 0.125rem;
    color: var(--color-link);
    vertical-align: middle;
    line-height: 1;
    font-weight: 600;
  }

  .dom_name {
    line-height: 1;
    vertical-align: middle;
    padding: 0 0.5rem 0 1px;
    .text {
      padding: 0 0.75rem 0 0;
      letter-spacing: 0.33px;
    }
    > * {
      vertical-align: middle;
    }
  }
  .optionsLink {
    cursor: pointer;
    color: var(--color-primary);
    padding-left: 0.5rem;
    opacity: 0.875;
    &:hover {
      opacity: 1;
    }
  }

  /*
   * domain suggestions legend - checkboxes
   */
  .dom_name {
    .symbol {
      padding: 0 0.25rem 0 0;
      @media (max-width: 599px) {
        font-weight: 600;
      }
    }
  }
  .ant-checkbox {
    > *,
    &::after {
      border-radius: 50% !important;
      overflow: hidden;
      border-color: currentColor !important;
    }
  }
`;
