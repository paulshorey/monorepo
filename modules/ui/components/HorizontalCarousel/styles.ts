import css from '@ps/ui/helpers/css';

export default {
  default: css`
    position: relative;
    max-width: 100vw;
    text-align: center;

    .__slides {
      position: relative;
      overflow: auto;
      display: flex;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
    }

    .__slides > * {
      position: relative;
      margin-right: 0.25rem;
      scroll-snap-align: start;
    }

    .__slides img {
      position: relative;
      width: auto;
    }

    .__arrows {
      pointer-events: none;
      font-size: 16px;
      font-weight: bold;
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
    }

    .__arrows .__prev,
    .__arrows .__next {
      color: currentColor;
      pointer-events: all;
      position: absolute;
      top: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-decoration: none;
      cursor: pointer;
      &.__hidden {
        opacity: 0;
      }
    }
    .__arrows .__prev {
      left: 0;
      padding-right: 15px;
    }
    .__arrows .__next {
      right: 0;
      padding-left: 15px;
    }

    /*
   * default arrows
   */
    .__arrows svg.__prev,
    .__arrows svg.__next {
      height: 67%;
      max-height: 84px;
      top: calc(49% - 42px);
      transform: scale(0.8, 1.15);
      color: orange;
    }
    .__arrows svg.__prev {
    }
    .__arrows svg.__next {
      margin-right: 1px;
    }
  `,
};
