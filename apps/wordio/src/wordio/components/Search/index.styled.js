import styled from "@emotion/styled";

export const Styled = styled.div`
  position: relative;
  z-index: 100;
  box-shadow: var(--box-shadow-dark);
  background: linear-gradient(167deg,hsl(200deg,95%,60%) 10%,hsl(230,80%,60%) 70%);
  > * {
    position: relative;
    z-index: 100;
  }
  .title_nav, .cue_nav {
    a, link {
      text-decoration:none;
      &:hover {
        text-decoration:underline;
      }
    }
  }
  .color-attention {
    color: var(--color-attention-dark);
    text-shadow: 0 0 15px hsl(220deg,60%,60%);
  }
  .content {
    position:relative;
    padding: 3.75rem 0 1.33rem;
  }
  .color-accent, .color-accent-dark, .color-accent-light, .color-accent-lighter, a, .link {
    color:var(--color-accent-lighter);
  }

  /*
   * Title
   */
  .title {
    position: relative;
    font-size: 1.5rem;
    line-height: 1.9rem;
    font-weight: 600;
    color: hsl(0, 0%, 95%);
    font-family: 'Quicksand', sans-serif;
    margin-top: -0.25rem;
    margin-bottom: 0.75rem;
    margin-right: -2px;
    vertical-align:middle;
    > * {
      vertical-align:middle;
    }
    a {
      text-decoration:none;
    }
    @media (max-width: 549px) {
      font-size: 1.5rem;
    }
    @media (max-width: 449px) {
      font-size: 1.33rem;
    }
    @media (min-width: 550px) and (max-width: 1099px) {
      color:var(--color-white);
    }
  }
  /*
   * Title nav
   */
  .title_nav {
    position: absolute;
    top: 2.5rem;
    right: -0.1rem;
    font-weight: 600;
    font-family: 'Quicksand',sans-serif;
    font-size: 1.125rem;
    color:rgba(255,255,255,0.9);
    a, .link {
      span {
        color:rgba(255,255,255,0.9);
      }
      svg {
        margin-left:0.1rem;
        //color:rgba(255,255,255,0.9);
      }
    }
  }

  /*
   * Cue
   */
  .cue {
    position: static;/* must be static, so not to float above the dropdown tld menu */ 
    margin: 0.3rem 0.125rem -0.3rem;
    font-family: 'Quicksand',sans-serif;
    color: var(--color-subtle);
    font-weight: 500;
    font-size: 1rem;
    line-height: 1rem;
    > * {
      padding: 0.33rem 0 0 0;
    }
    @media (max-width: 999px) {
      .cue-extra-line {
        color: inherit;
      }
    }
    @media (min-width: 550px) and (max-width: 1099px) {
      color:var(--color-subtle-light);
    }
    p {
      margin:0.5rem 0;
    }
  }
  
  /*
   * Cue nav
   */
  .cue_nav {
    position: absolute;
    margin: 1rem 0 -0.25rem;
    font-family: 'Quicksand', sans-serif;
    font-size: 1rem;
    right: 1px;
    top: 3.9rem;
    padding: 0 0 0.67rem;
    cursor: pointer;
    user-select: none;
    color: var(--color-subtle);
    white-space:nowrap;
    font-weight: 600;
    svg {
      font-size: 1.1em;
      vertical-align: -0.21em;
      margin-left: 0.1rem;
      width: auto;
    }
    .smaller {
      font-size: 0.9em;
      padding: 0;
      margin: 0;
      line-height: 1em;
      bottom: auto;
    }
  }

  /*
   * Input group (pill box)
   */
  .input-group {
    //width: 33rem;
    //min-width: 19rem;
    border-radius: 1.28rem;
    margin: -0.5px -1px -0.5px -1px;
    font-weight: 400;
    display: inline-flex;
    background: var(--color-coolwhite);
    @media (max-width:800px) {
      max-width: calc(100vw - 2.5rem);
    }
    /*
     * Layout / style
     */
    > *,
    .InputTld input {
      border-radius: 0;
    }
    > *:first-child {
      flex-grow: 1;
      /* 
      * If .Input is disabled, first child will be .SelectTld
      */
      border-top-left-radius: 1.25rem;
      border-bottom-left-radius: 1.25rem;
      padding-left: 1.25rem;
      &.input-padding {
        width: 0;
        flex-grow: 0;
      }
    }
    > *:last-child {
      border-top-right-radius: 1.25rem;
      border-bottom-right-radius: 1.25rem;
    }
    .Input,
    .InputTld input,
    .Button,
    .SelectTld {
      height: 2.25rem;
      line-height: 1;
      background:none; // background controlled by .input-group
    }
    .Input {
      overflow: hidden;
      padding-right: 0.25rem;
      flex-grow: 1;
      letter-spacing: 0.25px;
      padding-bottom: 0.44rem;
      var(--color-attention-dark);
      min-width: 9rem;
      color: var(--color-attention-dark);
      font-size: 1.5rem;
      //caret-color: var(--color-attention-dark);
      &::placeholder {
        color: var(--color-attention-dark);
      }
      border:none;
    }
    .Button {
      overflow: hidden;
      padding-left: 0.85rem;
      text-align: center;
      min-width: 2.5rem;
      font-size: 1.5rem;
      font-weight: 400;
      line-height: 1.33rem;
      .searchText {
        margin: -0.5rem 0.33rem 0.5rem 0;
      }
    }
    /*
     * .Input - interactions
     */
     box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4) inset;
     .InputTld input,
     input {
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.25);
     }
    .InputTld input:focus,
    .Input:focus {
      box-shadow: inset 1px 1px 2.5px rgba(0,0,0,0.5);
    }
    /*
     * .Button - interactions
     */
    .Button {
      border: none;
      outline: none;
      color: white;
      background: var(--color-attention-dark);
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.25);
    }
    .Button:hover {
      background: var(--color-attention-darker);
      //box-shadow: inset 100px 100px 100px rgba(0, 0, 0, 0.1) !important;
      //color: white;
    }
    .Button:focus {
      background: var(--color-attention-darker);
      //box-shadow: inset 100px 100px 100px rgba(0, 0, 0, 0.2) !important;
      //color: white;
    }
    /*
     * Select - interactions
     */
    .SelectTld {
      background: var(--color-coolwhite);
      @media (max-width: 549px) {
        font-size: 1rem;
      }
    }
    .SelectTld div[class*='-placeholder'],
    .SelectTld div[class*='-singleValue'] {
      //color: var(--color-medium);
      color: var(--color-attention-dark);
    }
    .SelectTld:hover div[class*='-control'] {
      box-shadow: inset 100px 100px 100px rgba(0, 0, 0, 0.1) !important;
    }
    .SelectTld:focus div[class*='-container'],
    .SelectTld:focus-within div[class*='-container'] {
      box-shadow: inset 1px 2px 3px rgba(0, 0, 0, 0.2) !important;
      border: none !important;
      outline: none !important;
    }
  }
  
  /*
   * Button spacing
   */
  .Button {
    padding-right: 0.5rem;
    .searchText {
      margin-right: 0.33rem;
      @media (max-width:629px) {
        display:none;
      }
    }
    .searchIcon {
      margin-right: 2rem;
      @media (min-width:630px) {
        visibility:hidden; /* HIDDEN ON RESULTS PAGE DESKTOP */
        margin-bottom: -0.1rem;
      }
    }
  }
  &.Home .Button {
    .searchIcon {
      visibility:visible !important; /* VISIBLE ON HOME PAGE ALWAYS */
      @media (min-width:630px) {
        margin-right: 2.67rem;
      }
      @media (max-width:629px) {
        margin-right: 1rem; // for small, without searchText
      }
    }
  }
  &.Word .Button {
    .searchIcon {
      margin-right:1rem;
    }
  }
  &.Home.Word .Button {
    .searchText {
      display:none;
    }
  }
  &.Home.Domains .Button {
    .searchText{
      @media (min-width:630px) {
        margin-right: 4.66rem;
        margin-bottom: 0.66rem;
        margin-top: -0.66rem;
      }
    }
    .searchIcon {
      margin-bottom: 0.1rem;
      margin-right: 4.45rem;
      @media (max-width:629px) {
        margin-right: 2.5rem;
      }
      @media (min-width:630px) {
        display:none;
      }
    }
  }


  /*
   * Home Page
   */
  &.Home {
    position: relative;
    background: linear-gradient(167deg,hsl(190deg,95%,65%)10%,hsl(255deg,75%,55%) 70%);
    height: 67vh;
    max-height: 40rem;
    display: flex;
    align-items: center;
    text-align:center;
    &.Word {
      height: 22.5rem;
    }
    .content {
      width: 100%;
      margin:0;
    }
    .cue {
      line-height: 1.67rem;
      font-size: 1.212rem;
      margin-top: 0.67rem;
    }
    .show_poss {
      display: none;
    }
    .title {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
      letter-spacing: 0.0125rem;
      @media (max-width: 999px) {
        font-size: 2.25rem;
        margin-bottom: 1.25rem;
      }
      @media (max-width: 799px) {
        font-size: 2rem;
        margin-bottom: 1.125rem;
      }
      @media (max-width: 499px) {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
    }
    /*
     * Custom input fields on domains homepage
     */
    .input-group {
      width: 30rem;
      @media (min-width: 1050px) {
        transform: scale(1.167);
      }
      margin: 0.33rem 0;
      > *:first-child {
        flex-grow:1;
      }
    }
    .Input {
      &::placeholder {
        font-size: 1.9rem !important;
        line-height:1.4rem !important;
      }
    }
  }
`;
