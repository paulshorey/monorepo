import { css } from '@emotion/react';

export default {
  default: (props) => css`
    // inverse parent bg color
    text-shadow: 1px 1px 5px var(--color-text);
    background: var(--color-text-gradient);
    color: var(--color-bg);
    .withRipple {
      background-color: var(--color-bg);
    }
    // if button has explicity color
    &[data-bgcolor] {
      text-shadow: 1px 1px 5px var(--color-bg);
      background: var(--color-bg-gradient);
      color: var(--color-text);
      .withRipple {
        background-color: var(--color-text);
      }
    }
    // all other styles
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    display: inline-flex;
    justify-content: space-between;
    cursor: pointer;
    vertical-align: middle;
    box-sizing: content-box;
    border: none;
    outline: none;
    box-shadow: 1px 2px 3px 0 hsl(0, 0%, 0%, 0.15);
    letter-spacing: 0;
    text-transform: unset;
    white-space: nowrap;
    min-width: 0;
    padding: 0;

    // add extra padding for last button in group
    &:last-child:not(:first-child) {
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

    &:hover,
    &:focus {
      outline: solid 2px var(--color-cta);
    }
    &:hover,
    &:focus:not(:hover) {
      background-size: 200% auto;
      transition: background-position 300ms linear 0s,
        background-size 300ms linear 0s;
      background-position: right center;
    }

    &:hover:not(:focus) {
      outline: none !important;
    }
    &:hover {
      box-shadow: 0 0 0 2px var(--color-cta) !important;
    }
    > *:not(.MuiTouchRipple-root) {
      position: relative;
      width: 100%;
    }
    /* 
    &:hover {
      > * {
        top: -1px;
        left: -1px;
      }
    }
    &:focus {
      > * {
        top: -1px;
        left: -1px;
      }
    }
    &:focus:not(:hover) {
      > * {
        top: -1px;
        left: -1px;
      }
    }
    &:focus:hover {
      > * {
        top: 0px;
        left: 0px;
      }
    } */

    .Button--spacer {
      display: inline-block;
      width: 0.5rem;
    }
    .Button--icon:first-child:last-child {
      margin-right: 0;
      display: inline-block;
      position: relative;
      transform: scale(1.25);
      transform-origin: center;
    }
    .Button--icon.Button--loading {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
      display: flex !important;
      align-items: center;
      justify-content: center;
      transform: scale(1.5);
    }

    // size, round, & other props
    height: ${props.theme.sizes.buttonsAndInputs.height[props.size || 'md']}rem;
    line-height: ${props.theme.sizes.buttonsAndInputs.height[
      props.size || 'md'
    ]}rem;
    > span {
      padding: 0
        ${props.theme.sizes.buttonsAndInputs.paddingX[props.size || 'md']}rem;
    }
    font-size: ${props.theme.sizes.buttonsAndInputs.fontSize[
      props.size || 'md'
    ]}rem;
    border-radius: 7px;
    font-weight: 500;
    letter-spacing: 0.33px;

    ${props.icon && !props.children
      ? `
      justify-content: center;
      > span {
        padding: 0;
      }
      width: ${
        props.theme.sizes.buttonsAndInputs.height[props.size || 'md'] + 0.1
      }rem;
    `
      : ''}

    ${props.round
      ? `
      border-radius: ${
        props.theme.sizes.buttonsAndInputs.height[props.size || 'md'] / 2
      }rem;
    `
      : ''}

    .withRipple_container {
      height: 200px;
      overflow: hidden;
      position: relative;
    }
    .withRipple {
      position: relative;
      display: inline-block;
      border-radius: 50%;
      pointer-events: none;
      position: absolute;
      transform: scale(0);
    }
    .withRipple_start {
      transform: scale(0.2);
    }
    .withRipple_active {
      transform: scale(2);
      transition: transform 700ms, opacity 700ms;
      opacity: 0;
    }
  `,
  /**
   * Like "outlined", but without the border
   */
  transparent: (props) => css`
    // inverse parent bg color
    color: var(--color-text);
    .withRipple {
      background-color: var(--color-text);
    }
    // if button has explicity color
    &[data-bgcolor] {
      color: var(--color-bg);
      .withRipple {
        background-color: var(--color-bg);
      }
    }
    // all other styles
    background: transparent;
    border: solid 1px transparent;
    text-shadow: none !important;
  `,
  outlined: (props) => css`
    // inverse parent bg color
    color: var(--color-text);
    border: solid 1px var(--color-text);
    .withRipple {
      background-color: var(--color-text);
    }
    // all other styles
    background: transparent;
    text-shadow: none !important;
  `,
  outlinedGradient: (props) => css`
    // inverse parent bg color
    color: var(--color-text);
    &::before {
      background: var(--color-bg);
    }
    .withRipple {
      background-color: var(--color-text);
    }
    // all other styles
    text-shadow: none !important;
    &::before {
      content: '';
      position: absolute;
      padding: 0;
      border-radius: 6px;
      top: 1px;
      left: 1px;
      width: calc(100% - 2px);
      height: calc(100% - 2px);
    }
    &:hover::before,
    &:focus:not(:hover)::before {
      transition: background-position 300ms linear 0s;
      background-position: center;
    }
    ${props.round
      ? `
      &::before {
        border-radius: calc(
          ${
            props.theme.sizes.buttonsAndInputs.height[props.size || 'md'] / 2
          }rem - 1px
        );
      }
    `
      : ''}
  `,
  text: (props) => css`
    // inverse parent bg color
    color: var(--color-text);
    .withRipple {
      background-color: var(--color-text);
    }
    // all other styles
    background: none;
    text-shadow: none !important;
    box-shadow: none;
  `,
  spinning: css`
    svg {
      animation: spin-linear 2s infinite linear;
      transform-origin: center;
    }
    @keyframes spin-linear {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
  pulsing: css`
    animation: pulse 4s infinite cubic-bezier(0.66, 0, 0, 1);
    @keyframes pulse {
      from {
        box-shadow: 0 0 0 0 var(--color-glow);
      }
      to {
        box-shadow: 0 0 0 30px transparent;
      }
    }
  `,
};
