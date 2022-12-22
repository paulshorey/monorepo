import { css } from '@emotion/react';

export default {
  wrapper: (props) => css`
    background: #333;
    overflow: auto;
    width: 100%;
    min-height: 100vh;
    user-select: none;
    white-space: nowrap;
    font-size: 24px;
    position: relative;
    .frames {
      padding-bottom: 60px;
      .frame {
        vertical-align: top;
        display: inline-block;
        margin: 0 3px;
        position: relative;
        overflow: hidden;
        iframe {
          display: block;
          transform: scale(0.67);
          transform-origin: left top;
        }
        &.isTablet {
          iframe {
            transform: scale(0.6);
          }
        }
        &.isDesktop {
          iframe {
            transform: scale(0.525);
          }
        }
      }
    }
  `,
  controlsTop: (props) => css`
    display: flex;
    align-items: center;
    width: 100%;
    color: #ccc;
    padding: 10px 5px 1px;
    font-size: 0.5em;
    > *:nth-child(2) {
      padding: 0 0.5rem;
    }
    > * {
      line-height: 1rem;
    }
  `,
};
