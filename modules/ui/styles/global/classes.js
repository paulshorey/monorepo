import { css } from '@emotion/react';

const classes = (theme) => css`
  .noWrap {
    white-space: nowrap;
  }

  .card {
    border-radius: 0.5rem;
    box-shadow: 1px 2px 3px 2px rgba(0, 0, 0, 0.1);
    padding: 0.75rem 0.75rem 0.95rem 1rem;
  }

  .gradientOutline {
    background: var(--color-bg-gradient);
    padding: 1px;
    &::before {
      content: '';
      position: absolute;
      z-index: 0;
      background: #333;
      top: 1px;
      left: 1px;
      width: calc(100% - 2px);
      height: calc(100% - 2px);
    }
    > * {
      position: relative;
      z-index: 1;
    }
  }

  .hoverTilt {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    &:hover {
      box-shadow: 0 0 50px rgb(17 17 17 / 20%);
      transform: rotate(-2deg) translateY(-2px) scale(1.05);
      ${theme.mq.sm} {
        transform: rotate(-1.5deg) translateY(-1px) scale(1.025);
      }
    }
  }

  .articleX {
    font-size: 1rem;
    width: 100%;
    max-width: 930px;
    margin-left: auto !important;
    margin-right: auto !important;
    /* padding-top: 2.5rem;
  padding-bottom: 5rem; */

    @media (max-width: 990px) {
      width: calc(100% - 60px);
      padding-left: 30px;
      padding-right: 30px;
      /* padding-top: 2rem;
    padding-bottom: 4rem; */
    }

    ${theme.mq.phone} {
      width: calc(100% - 40px);
      padding-left: 20px;
      padding-right: 20px;
      /* padding-top: 1.5rem;
    padding-bottom: 3rem; */
    }
  }

  .pageX {
    font-size: 1rem;
    width: 100%;
    max-width: 1170px;
    margin-left: auto !important;
    margin-right: auto !important;
    /* padding-top: 2.5rem;
  padding-bottom: 5rem; */

    @media (max-width: 1230px) {
      width: calc(100% - 60px);
      padding-left: 30px;
      padding-right: 30px;
      /* padding-top: 2rem;
    padding-bottom: 4rem; */
    }

    ${theme.mq.phone} {
      width: calc(100% - 40px);
      padding-left: 20px;
      padding-right: 20px;
      /* padding-top: 1.5rem;
    padding-bottom: 3rem; */
    }
  }

  /*
   * RESPONSIVE MARKUP
   */

  .hideLargeDesktop {
    ${theme.mq.largeDesktop} {
      display: none !important;
    }
  }

  .hideDesktop {
    ${theme.mq.desktop} {
      display: none !important;
    }
  }

  .hideMobile {
    ${theme.mq.mobile} {
      display: none !important;
    }
  }

  .hidePhone {
    ${theme.mq.phone} {
      display: none !important;
    }
  }

  .hideGt-phone {
    ${theme.mq.notPhone} {
      display: none !important;
    }
  }

  .hideSm {
    ${theme.mq.sm} {
      display: none !important;
    }
  }

  .hideLg {
    ${theme.mq.lg} {
      display: none !important;
    }
  }

  /*
   * Scrolling
   */

  .aTarget {
    position: absolute;
    top: -133px;

    ${theme.mq.sm} {
      top: -118px;
    }

    ${theme.mq.smallPhone} {
      top: -98px;
    }
  }

  body:not(.isScrolled) .showIfScrolled {
    display: none !important;
  }

  body.isScrolled .hideIfScrolled {
    display: none !important;
  }

  body:not(.isScrolledBelowTheFold) .showIfScrolledBelowTheFold {
    display: none !important;
  }

  body.isScrolledBelowTheFold .hideIfScrolledBelowTheFold {
    display: none !important;
  }

  body:not(.isScrolledVH70) .showIfScrolledVH70 {
    display: none !important;
  }
  body.isScrolledVH70 .hideIfScrolledVH70 {
    display: none !important;
  }

  body:not(.isScrolledVH70) .showBackgroundOnlyWhenScrolledVH70 {
    background: none !important;
    box-shadow: none !important;
  }

  /*
   * Font Awesome
   */
  svg:not(:root).svg-inline--fa,
  svg:not(:host).svg-inline--fa {
    overflow: visible;
    box-sizing: content-box;
  }
  .svg-inline--fa {
    display: var(--fa-display, inline-block);
    height: 1em;
    overflow: visible;
    vertical-align: -0.125em;
    cursor: pointer;
  }
`;

export default classes;
