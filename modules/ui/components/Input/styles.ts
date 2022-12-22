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
  default: (props) => `
    box-sizing: border-box;
    border: none;
    font-weight: 500;
    letter-spacing: 0.33px;
    background: white;
    ${borderRadius(props)};

    overflow: visible;
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    vertical-align: middle;
    text-shadow: none;
    padding: 0;

    color: #333;
    &::placeholder,
    input::placeholder,
    [role='img'] {
      color: #999 !important;
    }

    box-shadow: inset 1px 1px 0 0 hsl(0, 0%, 0%, 0.25);
    &:focus,
    &:focus-within,
    &:focus-visible {
      box-shadow: 0 0 0 2px var(--color-cta);
    }

    /*
     * Just the input by itself, without prefix/suffix before/after
     */
    &.ant-input {
      outline: none;
      padding: 0 ${paddingX(props, 1)}rem !important;
    }

    /*
     * With prefix/suffix before/after, input is rendered as child
     */
    input {
      flex-grow: 1;
      outline: none !important;
      border: none;
      background: transparent;
      margin: 1px 0 0;
      padding: 0 ${paddingX(props, 1)}rem !important;
    }

    &,
    input {
      font-size: ${fontSize(props, 1)}rem;
    }

    &,
    input,
    .ant-input-prefix,
    .ant-input-suffix,
    .ant-input-group-addon {
      vertical-align: middle;
      height: ${height(props, 1)}rem;
      line-height: ${height(props, 1)}rem;
    }

    .ant-input-prefix,
    .ant-input-suffix {
      display: inline-flex;
      text-align: center;
      justify-content: center;
      > span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
      }
    }

    .ant-input-prefix {
      padding-left: ${paddingX(props, 1)}rem;
      margin-right: -${paddingX(props, 0.5)}rem;
    }
    .ant-input-suffix {
      right: 0;
      padding-right: ${paddingX(props, 1)}rem;
      .ant-input-clear-icon {
        cursor: pointer;
        visibility: hidden;
      }
    }
    input[data-hasvalue='true'] + .ant-input-suffix .ant-input-clear-icon {
      visibility: visible;
    }

    /*
     * Hover/Focus
     */
    &:hover,
    &:focus:not(:hover) {
      background-size: 200% auto;
      transition: background-position 300ms linear 0s,
        background-size 300ms linear 0s;
      background-position: right center;
    }
  `,
};
