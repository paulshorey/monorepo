import React, { useEffect, memo } from 'react';
import { css } from '@emotion/react';
import debounce from '@techytools/fn/io/curry/debounce';

const style = css`
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  width: 100%;
  justify-content: space-between;
  color: #ccc;
  padding: 10px 5px 1px;
  font-size: 0.5em;
  > *:nth-child(2) {
    padding: 0 1rem;
  }
  > * {
    line-height: 1rem;
  }
`;
const ControlsBottom = () => {
  // show current screen size, for context
  const [windowWidth, set_windowWidth] = React.useState(0);
  const [windowHeight, set_windowHeight] = React.useState(0);
  const [windowInnerWidth, set_windowInnerWidth] = React.useState(0);
  const [windowInnerHeight, set_windowInnerHeight] = React.useState(0);
  const [windowPixelRatio, set_windowPixelRatio] = React.useState('0');
  const getWindowDimensions = () => {
    set_windowInnerWidth(window.innerWidth);
    set_windowInnerHeight(window.innerHeight);
    set_windowWidth(window.screen.width);
    set_windowHeight(window.screen.height);
    set_windowPixelRatio(window.devicePixelRatio.toFixed(1));
  };
  // on window resize, update windowWidth and windowHeight
  useEffect(() => {
    getWindowDimensions();
    const debouncedResize = debounce(getWindowDimensions, 100);
    window.addEventListener('resize', debouncedResize.bind(window));
    return () => {
      window.removeEventListener('resize', debouncedResize.bind(window));
    };
  }, []);

  return (
    <div css={style}>
      <div>
        <b>Your </b>
        <b>
          viewport = {windowInnerWidth} x {windowInnerHeight}
        </b>
        , screen = {windowWidth} x {windowHeight}, pixel density ={' '}
        {windowPixelRatio}
      </div>
      <div>
        <div
          css={css`
            width: 360px;
            text-align: center;
            padding: 0 0 7px;
            color: #666;
            cursor: default;
            text-shadow: 0 0 1px #333;
          `}
        >
          {`Use keyboard "Cmd +/-" to make preview frames bigger/smaller.`}
        </div>
      </div>
    </div>
  );
};
export default memo(ControlsBottom);
