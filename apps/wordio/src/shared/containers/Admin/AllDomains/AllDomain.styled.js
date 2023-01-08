import styled from "@emotion/styled";

export const StyledDomains = styled.div`
  a,
  b {
    font-weight: bold;
    color: var(--color-accent-dark);
  }
  div.line {
    font-size: 0.75rem;
    margin: 0;
    padding: 0.25rem 0.25rem 0.25rem 1rem;
    &.odd {
      background: #efefef;
    }
    .key {
    }
    .value {
      a {
        color: var(--color-link);
      }
    }
  }
  #domains_minimap {
    position: fixed;
    top: 0;
    right: 0;
    max-width: 150px;
    height: 100%;
    z-index: 1000;
    background: white;
    cursor: default;
    border-right: solid 17.5px white;
    border-left: solid 17.5px white;
    box-sizing: content-box;
  }
  #domains_content {
    white-space: nowrap;
  }
`;
