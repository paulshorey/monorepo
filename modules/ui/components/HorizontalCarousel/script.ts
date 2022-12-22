// @ts-nocheck
// tsFix: REFACTOR this file to use typescript
export default class HorizontalCarousel {
  /*
   * To be called in React useEffect or componentDidMount
   * after carousel div has been loaded into the DOM.
   * componentDidMount(){
   *    this.carousel = new horizontal_carousel(this.ref.current)
   * }
   * OR
   * <script>
   *    window.myCarousel = new horizontal_carousel(window.querySelector('#myCarousel')
   * </script>
   */
  constructor(carousel) {
    if (!carousel || !carousel.querySelectorAll) {
      // eslint-disable-next-line no-console
      console.warn('HorizontalCarousel: carousel element not found');
      return;
    }
    this.carousel = carousel;
    /*
     * Wait for the images to load, then init.
     */
    if (this.carousel) {
      /*
       * There is a bug with this implementation - if the images have loading="lazy", then this will never initiate!
       */
      this.private_init_carousel();
      // const images = this.carousel.querySelectorAll('img');
      // if (images && images.length) {
      //   /*
      //    * Find last image in last carousel - wait for it to finish loading.
      //    */
      //   const last_image = images[images.length - 1];
      //   if (last_image && last_image.complete) {
      //     /*
      //      * Image is already loaded - probably from browser cache
      //      */
      //     this.private_init_carousel();
      //   } else {
      //     /*
      //      * Wait for image to finish loading
      //      */
      //     last_image.onload = this.private_init_carousel;
      //   }
      // } else {
      //   /*
      //    * No images - fire up that carousel immediately!
      //    */
      //   this.private_init_carousel();
      // }
    }
  }

  /*
   * Important in an SPA like React. Call .end() when componentWillUnmount()
   * This stops event listeners which were started: el.click, window.scroll, window.resize.
   * componentWillUnmount(){
   *    this.carousel.end()
   * }
   * or
   * <script>
   *    window.myCarousel.end()
   * </script>
   */
  end = () => {
    this.el_prev &&
      this.el_prev.removeEventListener('click', this.private_handle_click_prev);
    this.el_next &&
      this.el_next.removeEventListener('click', this.private_handle_click_next);
    this.el_images &&
      this.el_images.removeEventListener(
        'click',
        this.private_handle_images_scroll
      );
    window.removeEventListener('click', this.private_handle_window_resize);
  };

  /**
   * INITIATE THE CAROUSELS
   *    Run script to bring the carousel to life
   */
  private_init_carousel = () => {
    const { carousel } = this;
    // fix temporary chromium bug - happens to certain horizontal-scrolled elements - even if this script not included
    // actually looks pretty cool - looks intentional - on page load, it scrolls a little, to bring attention to divs
    setTimeout(function () {
      if (
        typeof carousel === 'undefined' ||
        !carousel ||
        !carousel.querySelector
      ) {
        return;
      }
      const slides = carousel.querySelector('.__slides');
      if (slides) {
        slides.scrollTo(0, 0);
      }
    }, 1000);
    // add arrows if not exist
    const arrows = carousel.querySelector('.__arrows');
    if (!arrows) {
      this.private_add_arrows(carousel);
    }
    // fix arrows (show/hide left/right)
    this.private_fix_arrows();
    // dependents
    const prev = (this.el_prev = carousel.querySelector('.__prev'));
    const next = (this.el_next = carousel.querySelector('.__next'));
    const images = (this.el_images = carousel.querySelector('.__slides'));
    // prev/next
    next.addEventListener('click', this.private_handle_click_next);
    prev.addEventListener('click', this.private_handle_click_prev);

    /*
     * IMPORTANT: on manual user scroll, fix arrows
     */
    images.addEventListener('scroll', this.private_handle_images_scroll);
    // and on window resize, also fix arrows
    window.addEventListener('resize', this.private_handle_window_resize);
  };
  private_handle_images_scroll = () => {
    debounce(this.private_fix_arrows, 100)();
  };
  private_handle_window_resize = () => {
    debounce(this.private_fix_arrows, 200)();
  };
  private_handle_click_next = () => {
    const { el_images } = this;
    // smooth scroll to next frame
    el_images.scrollBy({
      left: el_images.clientWidth,
      top: 0,
      behavior: 'smooth',
    });
    // not sure how long the animation will take:
    setTimeout(this.private_fix_arrows, 500);
    setTimeout(this.private_fix_arrows, 750);
  };
  private_handle_click_prev = () => {
    const { el_images } = this;
    // smooth scroll to next frame
    el_images.scrollBy({
      left: -el_images.clientWidth,
      top: 0,
      behavior: 'smooth',
    });
    // not sure how long the animation will take:
    setTimeout(this.private_fix_arrows, 500);
    setTimeout(this.private_fix_arrows, 750);
  };
  /**
   * ADD ARROW ELEMENTS (prev/next buttons)
   */
  private_add_arrows = () => {
    const { carousel } = this;
    const arrows = `
    <div class="__arrows">
      <svg class="__prev" viewBox="8 8 192 512">
        <defs><filter id="shadow"><feDropShadow dx="5" dy="10" stdDeviation="5" flood-color="black" /></filter></defs>
        <path fill="currentColor" stroke="white" stroke-width="18" d="M192 127.338v257.324c0 17.818-21.543 26.741-34.142 14.142L29.196 270.142c-7.81-7.81-7.81-20.474 0-28.284l128.662-128.662c12.599-12.6 34.142-3.676 34.142 14.142z"></path>
      </svg>
      <svg class="__next" viewBox="-8 -8 192 512"
        <defs><filter id="shadow"><feDropShadow dx="5" dy="10" stdDeviation="5" flood-color="black" /></filter></defs>
        <path fill="currentColor" stroke="white" stroke-width="18" d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"></path>
      </svg>
    </div>
    `;
    // insert after slides
    const slides = carousel.querySelector('.__slides');
    if (!slides) {
      return;
    }
    // Mozilla says this does not corrupt existing elements, so should work with React:
    slides.insertAdjacentHTML('afterend', arrows);
  };
  /**
   * Hide left/right arrows when scrolled all the way left/right.
   */
  private_fix_arrows = () => {
    const { carousel } = this;
    const prev = carousel.querySelector('.__prev');
    const next = carousel.querySelector('.__next');
    const slides = carousel.querySelector('.__slides');
    const last_slide = carousel.querySelector('.__slides > *:last-child');
    if (slides.scrollLeft === 0) {
      /*
       * scrolled all the way left
       */
      prev.classList.add('__hidden');
    } else {
      prev.classList.remove('__hidden');
    }
    if (
      slides.scrollLeft + slides.clientWidth >=
      slides.scrollWidth - last_slide.clientWidth / 2
    ) {
      /*
       * scrolled all the way right (allow last child to be half cut-off)
       */
      next.classList.add('__hidden');
    } else {
      next.classList.remove('__hidden');
    }
  };
}

/*
 *
 * HELPER LIB:
 *
 */
function debounce(callback, wait) {
  let timeout = null;
  return function () {
    const callNow = !timeout;
    const next = function () {
      // eslint-disable-next-line prefer-rest-params
      return callback(arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(next, wait);
    if (callNow) {
      next();
    }
  };
}

/*
 *
 * EXPORT FOR BROWSER:
 *
 */
/*
 * Init one carousel (as a class, use "new"):
 * <script>
 *    let myCar = new horizontal_carousel(document.querySelectorAll('.__mycarousel'))
 *    // then, optionally, to remove event listeners:
 *    myCar.end()
 * </script>
 *
 * Init multiple carousels (as a function, without "new"):
 * <script>
 *    let refs = horizontal_carousels(document.querySelectorAll('.__mycarousel'))
 *    // then, optionally, to remove event listeners:
 *    for (let ref of refs) { ref.end(); }
 * </script>
 */
if (typeof window === 'object') {
  window.horizontal_carousel = HorizontalCarousel;
  window.horizontal_carousels = function (elements) {
    const refs = [];
    if (elements && elements.length) {
      for (const el of elements) {
        refs.push(new HorizontalCarousel(el));
      }
    }
    return refs;
  };
}
