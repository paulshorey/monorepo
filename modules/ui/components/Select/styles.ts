const paddingX = (props, multiplier = 1) =>
  props.theme.sizes.buttonsAndInputs.paddingX[props.size || 'md'] * multiplier;

const height = (props, multiplier = 1) =>
  props.theme.sizes.buttonsAndInputs.height[props.size || 'md'] * multiplier;

const fontSize = (props, multiplier = 1) =>
  props.theme.sizes.buttonsAndInputs.fontSize[props.size || 'md'] * multiplier;

const borderRadius = (props) => `
  border-radius: ${props.theme.sizes.buttonsAndInputs.borderRadius}rem;
  ${props.round && `border-radius: ${height(props, 0.5)}rem;`}
`;

export default {
  default: (props) => {
    return `
    box-sizing: border-box;
    background: white;
    &,
    .ant-select-selector {
      ${borderRadius(props)};
    }

    overflow: visible;
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    vertical-align: middle;
    text-shadow: none;
    box-sizing: content-box;
    border: none;
    font-weight: 500;
    letter-spacing: 0.33px;
    min-width: 100px;

    box-shadow: inset 1px 1px 0 0 hsl(0, 0%, 0%, 0.3);
    &:focus,
    &:focus-within,
    &:focus-visible {
      box-shadow: 0 0 0 2px var(--color-cta);
    }
    
    // placeholder color
    &,
    input {
      color: #333 !important;
      &::placeholder {
        color: #999 !important;
      }
    }
    .ant-select-selection-placeholder {
      color: #999 !important;
    }

    // input field
    input {
      position: relative;
      top: -2px;
      padding-left: 0;
    }
    input,
    input::placeholder,
    .ant-select-selector,
    .ant-select-selection-search,
    .ant-select-selection-placeholder,
    .ant-select-selection-overflow,
    .ant-select-selection-overflow-item,
    .ant-select-selection-item,
    .ant-select-selection-search-input,
    .ant-select-selection-search-mirror {
      font-size: ${fontSize(props, 1)}rem !important;
      vertical-align: middle !important;
      line-height: ${height(props, 1)}rem !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      border: none !important;
    }

    input,
    input::placeholder,
    .ant-select-selection-search,
    .ant-select-selection-placeholder,
    .ant-select-selection-overflow-item,
    .ant-select-selection-item,
    .ant-select-selection-search-input,
    .ant-select-selection-search-mirror,
    :where(.ant-select-single):not(.ant-select-customize-input) .ant-select-selector  {
      height: ${height(props, 1)}rem !important;
    }

    // cssFix: Important for multi-select field where the selections (tags) wrap to multiple lines:
    // .ant-select-selector,
    // .ant-select-selection-overflow {
    //   height: auto !important;
    // }

    .ant-select-selector {
      width: 100%;
    }

    [role='img'] {
      color: #999 !important;
    }

    .ant-select-selection-placeholder {
      margin-right: ${paddingX(props, 1)}rem;
    }

    .ant-select-selection-item {
      background: none !important;
      margin-right: 0 !important;
      padding: 0 ${paddingX(props, 0.25)}rem 0 0 !important;
    }

    &.ant-select-multiple {
      .ant-select-selection-search,
      .ant-select-selection-placeholder {
        .ant-select-selection-search-input,
        .ant-select-selection-search-mirror {
          padding: 0 0 0 0 !important;
        }
      }
    }

    .ant-select-selection-overflow-item
      + .ant-select-selection-overflow-item-suffix {
      padding: 0 0 0 ${paddingX(props, 0.25)}rem !important;
    }

    .ant-select-selection-overflow-item:not(.ant-select-selection-overflow-item-suffix) {
      padding: 0 0 0 ${paddingX(props, 0.5)}rem !important;
    }
    .ant-select-selection-overflow-item .ant-select-selection-item {
      padding: 0 !important;
    }

    .ant-select-selector {
      /* padding: 0; */
      border: none;
      background: none;
      box-shadow: none;
      outline: none;
    }

    .ant-select-suffix {
      font-size: 1em;
      &.anticon-search {
        font-size: 1rem;
      }
    }

    /* .ant-select-selection-search {
      min-width: 3rem;
    }
    .ant-select-selection-overflow {
      flex-wrap: nowrap;
      justify-content: end;
    } */
  `;
  },
};
