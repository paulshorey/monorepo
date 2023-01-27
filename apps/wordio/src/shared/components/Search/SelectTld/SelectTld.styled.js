import styled from "@emotion/styled";

export const Styled = styled.div`
  &.SelectTld {
    /*
     * NOTE: 
     * &div refers to self, so that it can be comma-separated and given same rules as children
     */
    padding: 0;
    outline:none !important;
    border:none !important;
    box-shadow:none !important;
    z-index: 200;
    min-width: 6.33rem;
    /*
     * Layout + Style
     */
    &div,
    div[class*='-container'],
    div[class*='-control'] {
      border-radius: 0;
      cursor: pointer;
      background: none;
      border: none;
      height: 2.25rem;
      min-height: 2.25rem;
      line-height: 2.25rem;
    }
    span[class*='-indicatorSeparator'] {
      display: none;
    }
    div[class*='-menu'] {
      z-index: 1000;
      min-width: 10rem;
      margin: 1px 0 0 0;
      border-radius: 0.5px;
      box-shadow: 0 0 0 1px hsla(220,37%,52%,0.33); 
      max-height: 80vh;
      border: none;
      &::before {
        content: ' ';
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background: hsla(220,10%,10%,0.10);
        user-select:none;
        pointer-events:none;
        z-index:100;
      }
      > div {
        max-height: 73vh;
        padding-left: 5px;
        padding-right: 5px;
        z-index: 1000;
        background: white;
      }
      div[class*='-MenuList'] {
        max-height: 75vh;
        padding: 0.35rem 0.4rem 0.5rem 0.4rem;
        background: white;
        z-index: 1000;
      }
      div[class*='-option'] {
        padding: 0.125rem 0.75rem 0.25rem;
        border-radius: 2.5px;
        cursor: pointer;
      }
    }
    /*
     * Interactions
     * border/outline on hover/focus
     * dark overlay behind menu
     */
    div[class*='-container'] {
      box-shadow: none !important;
      border: none !important;
      outline: none !important;
      background: none !important;
    }
    &:focus div[class*='-container'],
    &:focus-within div[class*='-container'] {
      background: none !important;
      cursor: text;
    }
    &.opened {
      div[class*='-control'] {
        background: var(--color-warmwhite);
      }
      div[class*='-singleValue'] {
        color: var(--color-light);
      }
    }
    &.opened::before {
      content: ' ';
      position: fixed;
      left: -5000px;
      width: 10000px;
      height: 4000px;
      background: rgba(0, 0, 0, 0.5);
      top: 0;
      bottom: auto;
      right: auto;
      opacity: 1;
      pointer-events: none;
      z-index: 100;
    }
    div[class*='-control'] {
      position:relative;
      background: var(--color-coolwhite);
      z-index: 101;
    }
    /*
     * Convert from px to rem
     * 2.25rem height/line-height
     * And vertically align everything!
     */
    font-size: 1.25rem;
    height: 2.25rem;
    line-height: 2.25rem;
    div[class*='-control'] {
      outline:none !important;
      border:none !important;
      box-shadow:none !important;
      > div {
        outline:none !important;
        border:none !important;
        box-shadow:none !important;
        padding: 0;
        line-height: 2.25rem;
        margin: 0;
        transform: none;
        height: 100%;
        display: flex;
        align-items: center;
      }
    }
    // selected value
    div[class*='-placeholder'],
    div[class*='-singleValue'] {
      padding: 0 2.25rem 0 0.5rem;
      line-height: 2.25rem;
      margin: 0;
      transform: none;
      display: flex;
      align-items: center;
      overflow: visible;
      position: static;
    }
    // blinking cursor
    div[class*='-Input'] {
      margin: 0 0 0 0.75rem;
      padding: 0;
      height: 2.25rem;
      line-height: 2.25rem;
      position: absolute;
      top: 0;
      left: 0;
      input {
        height: 2.25rem;
        line-height: 2.25rem;
      }
    }
    // caret-down
    div[class*='-IndicatorsContainer'] {
      padding: 0;
      line-height: 2.25rem;
      margin: 0;
      position: absolute;
      top: 0;
      right: 0;
      height: 2.25rem;
      display: inline-block;
      font-weight: 900;
      div[class*='-indicatorContainer'] {
        padding: 0 0.75rem;
        height: 2rem;
        display: flex;
        align-items: center;
        transform: scale(1.25);
        @media (max-width: 599px) {
          padding-right: 0.6rem;
        }
        @media (max-width: 499px) {
          padding-right: 0.5rem;
          color: var(--color-attention);
        }
        svg {
          fill: var(--color-attention-dark);
          stroke: var(--color-attention-dark);
        }
      }
    }
    
    /*
     * Built-code fix - .com value was too low or too high, very strange! 
     */
    div[class*='-control'] {
      > div:first-child {
        line-height:1;
        > div:last-child {
          position: absolute;
          left: 3px;
          top: 2px;
        }
      }
  }
`;
