import styled from "@emotion/styled";
// import { is_retina } from "@techytools/fn/browser/ui";

export const SedoStyled = styled.div`
  margin: 0 1.7rem 0.75rem;
  //width: calc(100% - 6rem);
  white-space: nowrap;
  font-weight: 600;
  font-size: 0.85rem;
  line-height: 1.5rem;
  color: var(--color-subtle-dark);
  overflow: auto;

  .controls {
    a {
      color: var(--color-subtle-dark);
    }
  }
`;

export const DomainStyled = styled.a`
  user-select: none;

  //color: var(--color-link);
  padding: 0 0.67rem;

  &:first-child {
    padding-left: 0;
  }

  a {
    text-decoration: none;

    b {
      text-decoration: underline;
    }
  }
`;
