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
  // the Material UI interactive bottom border
  &,
  &:hover, 
  &:focus, 
  &:focus-within {
    &::before,
    &::after {
      border-color: var(--color-text) !important;
      // background-color: var(--color-text) !important;
    }
  }
    // Normal colors
    color: var(--color-text) !important;
    * {
      color: var(--color-text) !important;
    }
    fieldset {
      border-color: var(--color-text) !important;
    }
    // Stateful colors
    .Mui-error {
      color: var(--color-error) !important;
      * {
        color: var(--color-error) !important;
      }
      fieldset {
        border-color: var(--color-error) !important;
      }
    }

    .MuiInputAdornment-root:first-child {
      margin-right: 0.5rem;
    }
    .MuiInputAdornment-root:first-child + input {
      margin-left: 0.75rem;
    }
    .MuiInputAdornment-root:last-child {
      margin-right: 0.75rem;
    }

  `,
};
