import { css } from '@emotion/react';
/*
 * Not used - for Antd version 4 which required a large default css file. This is so you can import a small css file that styles only the few things this library uses. (It's not finished though, needs more work for dropdowns.)
 * Antd version 5 uses css-in-js for each individual component, and does not require a global css file.
 */
const antd = (theme) => css`
  .ant-select-dropdown {
    width: auto !important;
    max-width: 20rem;
  }

  /*
 * 
 * SELECT
 * 
 */
  .ant-select:not(.ant-select-customize-input)
    .ant-select-selector
    .ant-select-selection-search-input {
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;
    outline: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  .ant-select-single:not(.ant-select-customize-input)
    .ant-select-selector
    .ant-select-selection-search-input {
    height: 30px;
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector input {
    cursor: pointer;
  }
  .ant-select-single .ant-select-selector .ant-select-selection-search-input {
    width: 100%;
  }
  .ant-select-show-search.ant-select:not(.ant-select-customize-input)
    .ant-select-selector {
    cursor: text;
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    position: relative;
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    -webkit-transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    width: 100%;
    height: 32px;
    padding: 0 11px;
  }
  .ant-select-single.ant-select-show-arrow .ant-select-selection-item,
  .ant-select-single.ant-select-show-arrow .ant-select-selection-placeholder {
    padding-right: 18px;
  }
  .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
    transition: none;
    pointer-events: none;
  }
  .ant-select-single .ant-select-selector .ant-select-selection-item,
  .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
    padding: 0;
    line-height: 30px;
    transition: all 0.3s;
  }
  .ant-select {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    font-variant: tabular-nums;
    line-height: 1.5715;
    list-style: none;
    font-feature-settings: 'tnum';
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  /*
 * 
 * DROPDOWN
 *  
 */
  .ant-slide-up {
    transition: transform 1s !important;
    overflow: hidden;
  }
  .ant-slide-up-enter {
    transform: scaleY(1);
  }
  .ant-slide-up-leave {
    transform: scaleY(0);
  }

  .ant-select-dropdown {
    margin: 0;
    color: #000000d9;
    font-variant: tabular-nums;
    line-height: 1.5715;
    list-style: none;
    font-feature-settings: 'tnum';
    position: absolute;
    top: -9999px;
    left: -9999px;
    z-index: 1050;
    box-sizing: border-box;
    padding: 4px 0;
    overflow: hidden;
    font-size: 14px;
    font-variant: initial;
    background-color: #fff;
    border-radius: 2px;
    outline: none;
    box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014,
      0 9px 28px 8px #0000000d;
  }

  .ant-select-item {
    position: relative;
    display: block;
    min-height: 32px;
    padding: 5px 12px;
    color: #000000d9;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .ant-select-item-option {
    display: flex;
  }
  .ant-select-item-option-content {
    flex: auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    color: #000000d9;
    font-weight: 600;
    background-color: var(--ant-primary-1);
  }
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled)
    .ant-select-item-option-state {
    color: var(--ant-primary-color);
  }
  .ant-select-item-option-state {
    flex: none;
  }

  /*
   * 
   * ICON
   * 
   */

  .anticon {
    display: inline-block;
    color: inherit;
    font-style: normal;
    line-height: 0;
    text-align: center;
    text-transform: none;
    vertical-align: -0.125em;
    text-rendering: optimizelegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .anticon svg {
    display: inline-block;
  }
  .anticon > * {
    line-height: 1;
    &:not(svg) {
      transform-origin: 0px 0px;
    }
  }

  /*
   * 
   * VARIABLES
   *
   */

  @media (max-width: 768px) :root {
    --docsearch-spacing: 10px;
    --docsearch-footer-height: 40px;
  }

  :root {
    --docsearch-primary-color: #5468ff;
    --docsearch-text-color: #1c1e21;
    --docsearch-spacing: 12px;
    --docsearch-icon-stroke-width: 1.4;
    --docsearch-highlight-color: var(--docsearch-primary-color);
    --docsearch-muted-color: #969faf;
    --docsearch-container-background: rgba(101, 108, 133, 0.8);
    --docsearch-logo-color: #5468ff;
    --docsearch-modal-width: 560px;
    --docsearch-modal-height: 600px;
    --docsearch-modal-background: #f5f6f7;
    --docsearch-modal-shadow: inset 1px 1px 0 0 hsla(0, 0%, 100%, 0.5),
      0 3px 8px 0 #555a64;
    --docsearch-searchbox-height: 56px;
    --docsearch-searchbox-background: #ebedf0;
    --docsearch-searchbox-focus-background: #fff;
    --docsearch-searchbox-shadow: inset 0 0 0 2px var(--docsearch-primary-color);
    --docsearch-hit-height: 56px;
    --docsearch-hit-color: #444950;
    --docsearch-hit-active-color: #fff;
    --docsearch-hit-background: #fff;
    --docsearch-hit-shadow: 0 1px 3px 0 #d4d9e1;
    --docsearch-key-gradient: linear-gradient(-225deg, #d5dbe4, #f8f8f8);
    --docsearch-key-shadow: inset 0 -2px 0 0 #cdcde6, inset 0 0 1px 1px #fff,
      0 1px 2px 1px rgba(30, 35, 90, 0.4);
    --docsearch-footer-height: 44px;
    --docsearch-footer-background: #fff;
    --docsearch-footer-shadow: 0 -1px 0 0 #e0e3e8,
      0 -3px 6px 0 rgba(69, 98, 155, 0.12);

    --ant-primary-color: #1890ff;
    --ant-primary-color-hover: #40a9ff;
    --ant-primary-color-active: #096dd9;
    --ant-primary-color-outline: rgba(24, 144, 255, 0.2);
    --ant-primary-1: #e6f7ff;
    --ant-primary-2: #bae7ff;
    --ant-primary-3: #91d5ff;
    --ant-primary-4: #69c0ff;
    --ant-primary-5: #40a9ff;
    --ant-primary-6: #1890ff;
    --ant-primary-7: #096dd9;
    --ant-primary-color-deprecated-pure: ;
    --ant-primary-color-deprecated-l-35: #cbe6ff;
    --ant-primary-color-deprecated-l-20: #7ec1ff;
    --ant-primary-color-deprecated-t-20: #46a6ff;
    --ant-primary-color-deprecated-t-50: #8cc8ff;
    --ant-primary-color-deprecated-f-12: rgba(24, 144, 255, 0.12);
    --ant-primary-color-active-deprecated-f-30: rgba(230, 247, 255, 0.3);
    --ant-primary-color-active-deprecated-d-02: #dcf4ff;
    --ant-success-color: #52c41a;
    --ant-success-color-hover: #73d13d;
    --ant-success-color-active: #389e0d;
    --ant-success-color-outline: rgba(82, 196, 26, 0.2);
    --ant-success-color-deprecated-bg: #f6ffed;
    --ant-success-color-deprecated-border: #b7eb8f;
    --ant-error-color: #ff4d4f;
    --ant-error-color-hover: #ff7875;
    --ant-error-color-active: #d9363e;
    --ant-error-color-outline: rgba(255, 77, 79, 0.2);
    --ant-error-color-deprecated-bg: #fff2f0;
    --ant-error-color-deprecated-border: #ffccc7;
    --ant-warning-color: #faad14;
    --ant-warning-color-hover: #ffc53d;
    --ant-warning-color-active: #d48806;
    --ant-warning-color-outline: rgba(250, 173, 20, 0.2);
    --ant-warning-color-deprecated-bg: #fffbe6;
    --ant-warning-color-deprecated-border: #ffe58f;
    --ant-info-color: #1890ff;
    --ant-info-color-deprecated-bg: #e6f7ff;
    --ant-info-color-deprecated-border: #91d5ff;

    --antd-wave-shadow-color: var(--ant-primary-color);
    --scroll-bar: 0;

    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  /* *::selection {
    color: #fff;
    background: var(--ant-primary-color);
  } */
`;
export default antd;
