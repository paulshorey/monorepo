import { css } from '@emotion/react';

/*
 * Ant Design v5 uses css-in-js, no longer requires a global css file. So, these are just a few overrides.
 */
const antd = (theme) => css`
  .ant-select-dropdown {
    width: auto !important;
    max-width: 20rem;
    .rc-virtual-list-holder {
      max-height: 49.5vh !important;
    }
    .ant-select-item-option {
      .Button {
        position: absolute;
        top: 2px;
        right: 0.1rem;
        height: calc(100% - 4px);
        line-height: 1em;
        display: flex;
        justify-content: center;
        align-items: center;
        > span {
          padding: 0 0.5rem 0 0.6rem;
        }
      }
    }
  }
`;
export default antd;
