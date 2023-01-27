import styled from "@emotion/styled";

export const StyledLinks = styled.ul`
  position: relative;
  --color-text: #111;
  margin: 0 -10vw;
  padding: 0;
  flex-grow: 1;
  display: flex;
  overflow: auto;
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
  &.scrollable::-webkit-scrollbar {
    height: 0 !important;
  }
  //box-shadow: inset 0 -3px 0 #ccc;
  li {
    display: list-item;
    list-style-type: disc;
    list-style-position: inside;
    &:first-child {
      list-style: none;
    }
    color: var(--color-text);
    white-space: nowrap;
    padding: 0 1rem 0 0;
    margin: 0;
    text-transform: lowercase;
    a {
      font-family: "Quicksand", sans-serif;
      font-weight: 500;
      height: 3rem;
      line-height: 2.5rem;
      font-size: 1.1rem;
      display: inline-block;
      color: var(--color-text);
      letter-spacing: 0.33px;
      border-bottom: solid 3px transparent;
    }
    &.selected {
      a {
        font-family: "Quicksand", sans-serif;
        font-weight: 900;
        border-color: var(--color-primary);
        color: var(--color-primary);
        pointer-events: none;
      }
    }
    //&.selected + li {
    //	margin-left: 0.5rem;
    //}
    //&:not(.selected) + .selected {
    //	margin-left: 0.5rem;
    //}
    &:hover:not(.selected) {
      a {
        transition: none;
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }
    &:last-child:not(.selected) {
      a {
        color: var(--color-accent);
        font-weight: 600;
      }
    }
    &:first-child {
      padding-left: 10vw;
    }
    &:last-child {
      padding-right: 10vw;
    }
  }
`;
