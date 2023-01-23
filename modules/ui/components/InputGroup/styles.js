import { css } from '@emotion/react';

export default {
  default: (props) => css`
    display: flex;
    width: 100%;
    box-sizing: border-box;
    * {
      min-width: 0;
    }
    > *:not(:first-child) {
      &,
      .ant-select-selector {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    > *:not(:last-child) {
      border-right: 0;
      &,
      .ant-select-selector {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    // add extra padding for last button in group
    > .Button:last-child:not(:first-child) {
      .Button--text {
        ${
          // ! circle icon button
          !(props.round && props.icon && !props.children) &&
          // ! has icon on right side
          !props.suffix &&
          `
        padding-right: 1rem;
        `
        }
      }
    }

    /*
    * MUI
    */
    ${props.theme.mq.sm} {
      .InputMui,
      .SelectMui {
        // to help it align when in InputGroup, side by side with input/select/button
        position: relative;
        top: -1px;
      }
    }
  `,
};
