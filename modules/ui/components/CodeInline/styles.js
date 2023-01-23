export default {
  default: `
    top: -0.05rem;
    position: relative;
    padding: 0 0.5rem 0.1rem;
    vertical-align: middle;
    white-space: pre;
    font-size: 0.95rem;
    font-style: normal;
    text-decoration: none;
    border-radius: 4px;
    display: inline-block;
    overflow: hidden;
    color: var(--color-text);
    background: none !important;
    &::before {
      content: ' ';
      position: absolute;
      opacity: 0.25;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      background: var(--color-bg);
    }
    &,
    > span {
      font-family: var(--font-family-code);
    }
    > span {
      position: relative;
      z-index: 1;
      > * {
        opacity: 0.5;
      }
    }
  `,
  transparentBg: `
    &::before {
      opacity: 0.125;
    }
  `,
  noBg: `
    padding: 0 0.1rem;
    &::before {
      opacity: 0;
      background-color: transparent;
    }
  `,
  /**
   * no bg, no padding
   */
  text: `
    top: -0.1rem;
    font-size: 0.95em;
    line-height: inherit;
    background-color: transparent;
    border: none;
    padding: 0 0.1rem;
    &::before {
      display: none;
    }
  `,
  redacted: `
    &::before {
      opacity: 1;
      z-index: 10;
    }
  `,
};
