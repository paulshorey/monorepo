export default {
  default: (props) => `
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

    fieldset {
      border-top: none;
      border-left: none;
      border-right: none;
      border-radius: 0;
    }
  `,
};
