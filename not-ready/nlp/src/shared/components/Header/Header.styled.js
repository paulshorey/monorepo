import styled from "@emotion/styled";

export const StyledHeadContainer = styled.div`
  &.wrapInContainer {
    z-index: 100;
    height: 2.5rem;
    background: var(--color-primary);
    position: relative;
    margin-bottom: 0;
  }
`;
export const StyledHeader = styled.div`
  position: relative;
  z-index: 100;
`;
export const StyledHead = styled.div`
  position: absolute; // make "fixed" on homepage
  background: linear-gradient(167deg, hsl(226deg 92% 61%) 10%, transparent 90%);
  &.isHome {
    background: linear-gradient(171deg, hsl(255deg, 75%, 55%), hsl(190 90% 55% / 0.01) 75%, transparent 100%);
  }
  @media (max-width: 999px) {
    background: linear-gradient(
      156deg,
      // more left-right
      hsl(230 88% 60% / 1) 0%,
      hsl(225 90% 55% / 0.67) 33%,
      // changed to 33%
      // removed
      transparent 90%,
      // changed to 90%
      transparent 100%
    );
  }
  height: 2.5rem;
  line-height: 2.4rem;
  padding-top: 1px;
  width: 100%;
  z-index: 101;
  .link,
  a {
    text-decoration: none;
  }
`;
export const StyledHeadUnder = styled.div`
  position: fixed;
  background: hsl(195, 70%, 55%);
  height: 2.5rem;
  padding-top: 1px;
  width: 100%;
  z-index: 100;
`;
export const StyledLogoContainer = styled.div`
  &.hidebeta {
    .beta {
      display: none;
    }
  }
  h2 {
    user-select: none;
    font-family: "Quicksand", sans-serif;
    padding: 0 0 0 0.125rem;
    margin: 0;
    height: auto;
    line-height: 1;
    white-space: nowrap;
    text-indent: -0.1rem;
    font-size: 1.125rem;
    display: inline-block;
    font-weight: 700;
    color: hsl(0, 0%, 80%);
    position: relative;
    top: 0;
    a {
      color: var(--color-warmwhite);
    }
    b {
      font-weight: 900;
    }
    .vmiddle {
      vertical-align: baseline;
      font-size: 1.175rem;
    }
    .color-accent {
      color: hsl(74, 90%, 50%);
    }
  }
  h5 {
    margin: 0;
    padding: 0;
    line-height: 0;
    height: auto;
    text-transform: uppercase;
    color: var(--color-primary-overlay);
    font-size: 0.9rem;
    font-weight: 600;
  }
  .beta {
    margin-left: 0.51rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: bold;
    vertical-align: baseline;
    font-size: 0.85rem;
    position: relative;
    top: 1px;
    @media (max-width: 799px) {
      vertical-align: 1.5px;
    }
    //&::before {
    //  content: "(";
    //}
    //&::after {
    //  content: ")";
    //}
  }
`;

export const StyledToplinks = styled.div`
  position: absolute;
  top: 0;
  right: 1.5rem;
  font-size: 1.125rem;
  line-height: 2.125rem;
  cursor: pointer;
  font-weight: 600;
  font-family: "Quicksand", sans-serif;
  > * {
    vertical-align: middle;
  }
  a {
    color: hsla(0, 0%, 100%, 0.9);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-right: 3rem;
    //text-decoration: underline;
    @media (max-width: 979px) {
      &.first {
        display: none;
      }
    }
    @media (max-width: 819px) {
      &.third {
        display: none;
      }
    }
    @media (max-width: 650px) {
      &.second {
        display: none;
      }
    }
    @media (max-width: 500px) {
      display: none;
    }
  }
`;
export const StyledLogoLink = styled.span`
  white-space: nowrap;
  vertical-align: baseline;
  font-size: inherit;
`;

export const StyledRightHamburger = styled.div`
  position: absolute;
  top: 0.414rem;
  right: -1px;
  font-size: 1rem;
  line-height: 1rem;
  cursor: pointer;
  background: rgba(50, 50, 150, 0.05);
  > * {
    vertical-align: middle;
  }
  .faBars {
    font-size: 1.444rem;
    line-height: 1;
    display: inline-block;
    color: white; //var(--color-accent-light);
    box-shadow: 0 0 10px rgba(50, 50, 150, 0.1);
    cursor: pointer;
  }
  @media (max-width: 600px) {
    right: 0.33rem;
  }
`;

export const StyledHeaderDropdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  display: none;
  &.visible {
    display: block;
  }
`;

export const StyledHeaderDropdown = styled.div`
  position: absolute;
  top: -2px;
  right: -1rem;
  user-select: none;
  background: rgb(88 92 247);
  color: var(--color-dark);
  border: none;
  text-align: right;
  white-space: nowrap;
  z-index: 1000;
  padding: 0 2rem 1.875rem 1.5rem;
  font-size: 0.9rem;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.5);
  border-radius: 0 0 0 0;
  display: none;
  overflow: hidden;
  &.visible {
    display: block;
  }

  * {
    background: none;
    box-shadow: none !important;
    border: none !important;
  }

  .divider {
    text-align: left;
    color: var(--color-subtle); // very subtle title: hsl(203, 50%, 75%)
    font-size: 1rem;
    font-weight: 500;
    font-family: "Quicksand", sans-serif;
    padding: 2.5rem 0 0.75rem 0.67rem;
  }
  .spacer {
    height: 1.5rem;
  }

  li {
    user-select: none;
    padding: 0 0.8rem !important;
    margin: 0 !important;
    height: auto !important;
    line-height: 2rem !important;
    color: var(--color-warmwhite);

    a {
      color: var(--color-accent-light);
    }
    a:hover {
      color: var(--color-accent-light);
      text-decoration: underline;
    }
  }
  .h6,
  h6 {
    user-select: none;
    font-family: "Quicksand", sans-serif;
    padding: 0;
    margin: 0;
    height: auto;
    white-space: nowrap;
    text-indent: -0.1rem;
    font-size: 1.125rem;
    display: block;
    font-weight: 600;
    color: var(--color-subtle);
    position: relative;
    top: 1px;

    &:last-child {
      border: none;
    }
    &.small {
      font-size: 1rem;
      line-height: 1.75rem !important;
    }
  }

  //.ant-menu-item.small a:hover,
  //.divider a:hover {
  //  &::after {
  //    content: " (click)";
  //  }
  //}
`;
