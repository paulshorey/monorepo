import React, { createRef, useEffect, useState } from 'react';
import Slider from '@ps/infinite-react-carousel';
import { useSwipeable } from 'react-swipeable';
import { useInView } from 'react-cool-inview';
import getQueryParam from '@ps/fn/browser/url/get_query_param';
import is_ios from '@ps/fn/browser/device/is_ios';
import { Props } from './index';

/**
 * Infinite Carousel slider (click previous/next to advance left/right, click the dots for a specific slide)
 */
// DEBUG mobile Safari scroll interaction when InfiniteCarousel swiped:
// function throttle(callback, limit) {
//   var waiting = false; // Initially, we're not waiting
//   return function () {
//     // We return a throttled function
//     if (!waiting) {
//       // If we're not waiting
//       callback.apply(this, arguments); // Execute users function
//       waiting = true; // Prevent future invocations
//       setTimeout(function () {
//         // After a period of time
//         waiting = false; // And allow future invocations
//       }, limit);
//     }
//   };
// }
// function windowScrollDisableThrottled(disable) {
//   throttle(function () {
//     windowScrollDisable(disable);
//   }, 100);
// }

// Attempt to fix mobile Safari scroll interaction when InfiniteCarousel swiped
let windowScrollDisableTimeout;
function windowScrollDisable(disable) {
  clearTimeout(windowScrollDisableTimeout);
  if (typeof window === 'undefined') {
    return;
  }
  // this fix is ONLY for iOS (should only target Safari)
  const isIOS = is_ios();
  if (!isIOS) {
    return;
  }
  if (!disable) {
    window.document.body.classList.remove('overflowHidden');
    return;
  }
  window.document.body.classList.add('overflowHidden');
  windowScrollDisableTimeout = setTimeout(() => {
    window.document.body.classList.remove('overflowHidden');
  }, 300);
}

const InfiniteCarousel: React.FC<Props> = ({
  children,
  className,
  controls,
  useSwipeOverlay = true,
  // used in styles to set width/height of dots and arrows:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  smallerDots = false,
  autoplay = true,
  autoplaySpeed = 4800,
  dots = true,
  overScan = 1,
  slowerOnDesktop = 0,
  msResumeWhileHover = 0,
  msResumeAfterHover = 1000,
  ...props
}) => {
  if (slowerOnDesktop && typeof window === 'object') {
    const width =
      window?.document?.documentElement?.clientWidth || window?.innerWidth;
    if (width > 800) {
      autoplaySpeed = autoplaySpeed * slowerOnDesktop;
    }
  }
  if (!msResumeWhileHover) {
    msResumeWhileHover = autoplaySpeed * 2.5;
  }
  let slideshowPauseTimeout;
  const slideshowRef: any = createRef();
  /*
   * Do not animate if ?qaStatic queryString flag is set
   */
  const [doNotStart, set_doNotStart] = useState(false);
  useEffect(() => {
    if (slideshowRef?.current?.slickPause) {
      slideshowRef?.current?.slickPause();
    }
    const qaStatic = getQueryParam('qaStatic');
    if (qaStatic !== null) {
      set_doNotStart(true);
    }
  }, []);
  /*
   * Only animate/enable when in view (otherwise consumes a lot of processing power and slows down the whole page!)
   */
  const { observe, inView } = useInView({
    onEnter: () => {
      window.dispatchEvent(new Event('resize'));
    },
  });
  const componentRef: any = observe;
  useEffect(() => {
    if (inView) {
      if (!doNotStart) {
        if (slideshowRef?.current?.slickPlay) {
          slideshowRef?.current?.slickPlay();
        }
      }
    } else {
      if (slideshowRef?.current?.slickPause) {
        slideshowRef?.current?.slickPause();
      }
    }
  }, [inView]);
  /*
   * Pause slideshow on mobile, when touched
   */
  const onMouseOut = () => {
    // on mouse out, resume slideshow
    // (not reliable, so debounce it after 1 second - if onMouseOver happens before that, ok )
    clearTimeout(slideshowPauseTimeout);
    slideshowPauseTimeout = setTimeout(() => {
      if (!doNotStart) {
        if (slideshowRef?.current?.slickPlay) {
          slideshowRef?.current?.slickPlay();
        }
      }
    }, msResumeAfterHover);
  };
  const onHover = () => {
    // pause slideshow on hover - built-in functionality ignores .carousel-dots
    clearTimeout(slideshowPauseTimeout);
    if (slideshowRef?.current?.slickPause) {
      slideshowRef?.current?.slickPause();
      // on mouse out, resume slideshow
      // (not possible to do on mouse out, so just wait 10 seconds)
      slideshowPauseTimeout = setTimeout(() => {
        if (!doNotStart) {
          if (slideshowRef?.current?.slickPlay) {
            slideshowRef?.current?.slickPlay();
          }
        }
      }, msResumeWhileHover);
    }
  };
  useEffect(() => {
    // start listener on componentDidMount
    if (
      componentRef &&
      componentRef.current &&
      componentRef?.current?.addEventListener
    ) {
      componentRef?.current?.addEventListener('touchstart', onHover);
    }
    // cleanup on componentWillUnmount
    return () => {
      if (slideshowPauseTimeout) {
        clearTimeout(slideshowPauseTimeout);
      }
      if (
        componentRef &&
        componentRef.current &&
        componentRef?.current?.addEventListener
      ) {
        componentRef?.current?.removeEventListener('touchstart', onHover);
      }
    };
  }, []);
  /*
  /*
   * Detect swipe (pause on start of swipe)
   */
  const swipeHandlers = useSwipeable({
    onSwiped: (eventData) => {
      if (useSwipeOverlay) {
        if (eventData.dir === 'Right') {
          slideshowRef?.current?.slickPrev();
        }
        if (eventData.dir === 'Left') {
          slideshowRef?.current?.slickNext();
        }
        setTimeout(() => {
          if (!doNotStart) {
            slideshowRef?.current?.slickPlay();
          }
        }, 300);
      }
    },
    // onSwiping: (eventData) => {},
    onSwipeStart: (eventData) => {
      windowScrollDisable(eventData.absX * 5 > eventData.absY); // if swipe left even a little bit (5x multiplier), disable
      slideshowRef?.current?.slickPause();
    },
    trackTouch: true,
    trackMouse: true,
  });
  /*
   * Custom controls in parent component
   */
  if (typeof controls === 'object') {
    controls.back = () => {
      slideshowRef?.current?.slickPrev();
    };
    controls.next = () => {
      slideshowRef?.current?.slickNext();
    };
  }
  /*
   * Render
   */
  if (!children) {
    return null;
  }
  return (
    <div
      {...props}
      role="none"
      onMouseOut={onMouseOut}
      onBlur={onMouseOut}
      onClick={onHover}
      onMouseOver={onHover}
      onFocus={onHover}
      ref={componentRef}
      className={className}
    >
      {!!useSwipeOverlay && (
        <div
          className={'InfiniteCarousel__useSwipeOverlay '}
          {...swipeHandlers}
        />
      )}
      <Slider
        ref={slideshowRef}
        autoplay={autoplay}
        autoplaySpeed={autoplaySpeed}
        overScan={overScan}
        dots={dots}
        className={'InfiniteCarousel__Slider'}
      >
        {children}
      </Slider>
    </div>
  );
};
export default InfiniteCarousel;
