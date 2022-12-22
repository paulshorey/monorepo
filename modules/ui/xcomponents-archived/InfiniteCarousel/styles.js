import { css } from '@emotion/react';

export default {
  default: (props) =>
    css`
      .carousel-dot button::before {
        color: var(--color-text);
        opacity: 0.25;
      }

      .carousel-dots-active button::before {
        opacity: 1 !important;
      }

      .InfiniteCarousel__Slider {
        position: relative;
      }
      .InfiniteCarousel__useSwipeOverlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 101;
      }
      margin-left: -15px;
      margin-right: -15px;
      overflow: hidden;
      position: relative;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 0;
      padding-bottom: 50px;
      user-select: none;
      -webkit-user-select: none;

      ${props.theme.mq.sm} {
        padding-bottom: 25px;
      }

      &:hover .carousel-dots {
        z-index: 2000;
      }

      * {
        outline: none !important;
        user-select: none !important;
      }

      .carousel-item {
        position: absolute;
        top: 0;
        left: 0;
        outline: none !important;

        * {
          outline: none !important;
        }
      }

      .InfiniteCarousel__Slider {
        width: 100%;
      }

      .carousel-initialized {
        overflow: hidden;
        position: relative;
      }

      .carousel-arrow.carousel-hidden {
        display: none;
      }

      .carousel-track {
        width: 100%;
        display: flex;
        position: relative;
      }

      /* Arrows */

      span.carousel-arrow {
        display: ${props?.options?.showArrows ? 'inline-block' : 'none'};
        position: relative;
        vertical-align: middle;
        width: ${props?.options?.smallerDots ? '13' : '20'}px;
        height: ${props?.options?.smallerDots ? '13' : '20'}px;
        line-height: ${props?.options?.smallerDots ? '13' : '20'}px;
        overflow: visible;
        cursor: pointer;

        > span {
          position: absolute;
          color: currentColor;
        }

        opacity: 0.4;

        &:hover {
          opacity: 1;
        }

        &:first-child > span {
          right: ${props?.options?.smallerDots ? '11' : '15'}px;
        }

        &:last-child > span {
          left: ${props?.options?.smallerDots ? '11' : '15'}px;
        }
      }

      /* Dots */

      .carousel-dots {
        position: relative;
        display: block;
        width: 100%;
        padding: 20px 0 0 0;
        list-style: none;
        text-align: center;
      }

      .carousel-dots .carousel-dot {
        position: relative;

        display: inline-block;
        vertical-align: middle;

        width: ${props?.options?.smallerDots ? '13' : '20'}px;
        height: ${props?.options?.smallerDots ? '13' : '20'}px;
        margin: 0 5px;
        padding: 0;

        cursor: pointer;
      }

      .carousel-dots .carousel-dot button {
        font-size: 0;
        line-height: 0;

        display: block;

        width: ${props?.options?.smallerDots ? '13' : '20'}px;
        height: ${props?.options?.smallerDots ? '13' : '20'}px;
        padding: 5px;

        cursor: pointer;

        color: transparent;
        border: 0;
        outline: none;
        background: transparent;
      }

      .carousel-dots .carousel-dot button:hover,
      .carousel-dots .carousel-dot button:focus {
        outline: none;
      }

      .carousel-dots .carousel-dot button:hover:before,
      .carousel-dots .carousel-dot button:focus:before {
        opacity: 1;
      }

      .carousel-dots .carousel-dot button:before {
        font-family: 'slick';
        font-size: ${props?.options?.smallerDots ? '40' : '50'}px;
        line-height: 20px;

        position: absolute;
        top: 0;
        left: 0;

        width: ${props?.options?.smallerDots ? '13' : '20'}px;
        height: ${props?.options?.smallerDots ? '13' : '20'}px;

        content: '•';
        text-align: center;

        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .InfiniteCarousel__Slider .carousel-initialized.scrolling .CustomArrow {
        display: none;
      }

      /*
      *  Homepag3
       */

      margin-left: auto;
      margin-right: auto;
      text-align: center;
      scroll-snap-align: center;

      ${props.theme.mq.lg} {
        width: 100%;
        overflow: visible;
      }

      > * {
        max-width: 500px;
        margin: 0 auto;
        overflow: visible;

        @media (max-width: 768px) {
          max-width: ${768 + 20}px;
          margin: 0 -10px;
        }

        @media (max-width: 600px) {
          max-width: ${600 + 30}px;
          margin: 0 -15px;
        }
      }

      .carousel-dots {
        position: relative !important;
      }

      .carousel-initialized {
        overflow: visible !important;
        padding: 0 !important;
      }

      .carousel-track {
        overflow: visible;
        text-align: center;

        > * {
          padding: 0.33rem;
          text-align: center;

          ${props.theme.mq.smallPhone} {
            padding: 0;
          }
        }

        img {
          width: 100%;
          height: auto;
        }
      }

      svg {
        width: ${props?.options?.smallerDots ? '13' : '20'}px;
        height: ${props?.options?.smallerDots ? '13' : '20'}px;
        display: inline-block;
        color: white;
      }
      span.carousel-arrow {
        color: white;
        display: inline-block;
      }
    `,
};
