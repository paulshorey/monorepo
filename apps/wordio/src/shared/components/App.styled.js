import styled from "@emotion/styled";
// Maybe use gradient background?...
// background: linear-gradient(to bottom,#fff 0%, hsl(0,0%,97%) 67%, hsl(0,0%,92%) 99%, #cccccc 100%);
// background: linear-gradient(to bottom,hsl(85,50%,100%) 0%,hsl(85,50%,90%) 77%, hsl(85,50%,90%) 92%, hsl(85,50%,90%) 99%, hsl(85,0%,80%) 100%);
// border-bottom: solid 1px #000;

export const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  .footerCopyright {
    background: white;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    border-top: solid 1px #ededed;
    p {
      margin-top: 0.33rem;
      margin-bottom: 0.33rem;
      color: rgba(0, 0, 0, 0.5);
      font-size: 0.75rem;
    }
    a {
      color: var(--color-accent-dark);
      &.color-accent {
        color: var(--color-accent);
      }
    }
  }
  .headerBackground {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 2.5rem;
    z-index: 1;
    background: var(--color-gradient-home-large);
    &::before,
    &::after {
      content: " ";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      filter: saturate(1.25);
    }
    &::before {
      background: var(--color-gradient-primary-search);
      opacity: 0.33;
    }
    &::after {
      content: " ";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url("/bg-domains1.png");
      background-size: cover;
      opacity: 0.25;
    }
  }
  .faBolt {
    color: var(--color-accent-light);
    position: relative;
    top: 0.075rem;
    transform: scale(0.9);
  }
`;

export const StyledHead = styled.div`
  position: relative;
  padding: 0.75rem 0;
  background: hsl(0, 0%, 5%);
`;

export const StyledSearch = styled.div`
  position: relative;
  background: var(--color-primary);
  &.DomainsHome {
    padding: 4rem 0;
  }
`;
export const StyledPage = styled.div`
  position: relative;
  padding-top: 0;
  padding-bottom: 1rem;
  color: #182026;
  min-height: 100vh;
  background: white;
`;

export const StyledPageHead = styled.div``;
export const StyledPageBody = styled.div``;

export const StyledButtonset = styled.div`
  margin: 1.5rem 0 1rem 0;
`;

export const StyledNavTabs = styled.div`
  background: black;
`;
