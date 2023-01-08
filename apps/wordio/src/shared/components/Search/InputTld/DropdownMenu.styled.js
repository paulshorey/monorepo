import styled from "@emotion/styled";

export const Styled = styled.div`
  background: white;
  display: flex;
  padding: 0 0.5rem;
  position: absolute;
  right: 0;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.25);
  width: 100%; // temporary - remove when add .categories
  z-index: 110;
  &.hidden {
    //display:none;
  }

  > .tlds {
    max-height: calc(100vh - 15rem);
    overflow: auto;
    width: 100%;
    .tld {
      font-size: 1.125rem;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      color: var(--color-link-dark);
      &:hover {
        background: var(--color-link-light);
        color: white;
      }
      &.selected {
        background: var(--color-link);
        color: white;
      }
    }
  }
  > .categories {
    min-width: 10rem;
  }
`;
