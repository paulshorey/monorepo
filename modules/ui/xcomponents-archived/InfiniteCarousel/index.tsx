import React, { memo, forwardRef } from 'react';
import TheCarousel from './TheCarousel';
import getQueryParam from '@ps/fn/browser/url/get_query_param';
import variants from './styles';
import withCombinedProps from '@ps/ui/hooks/withCombinedProps';
import styled from '@emotion/styled';
import withStyles from '@ps/ui/hooks/withStyles';
import ssProps from '@ps/ui/types/styles';

export type Props = {
  smallerDots?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  dots?: boolean;
  overScan?: number;
  slowerOnDesktop?: number;
  msResumeWhileHover?: number;
  msResumeAfterHover?: number;
  useSwipeOverlay?: boolean;
  controls?: {
    back: () => void;
    next: () => void;
  };
  children?: any;
  className?: string;
} & ssProps;

/**
 * All children must be the same aspect ratio. If you need to render a carousel with different aspect ratios, use HorizontalCarousel component.
 */
export const Component = (props: Props) => {
  const [showCarousel, set_showCarousel] = React.useState(false);
  React.useEffect(() => {
    // disable for Search Engines, QA, LightHouse test, and other bots
    const disableForBots =
      /bot|googlebot|crawler|spider|robot|crawling|lighthouse/i.test(
        window.navigator.userAgent
      );
    if (disableForBots && disableForBots !== null) {
      // disable
    } else {
      // enable
      set_showCarousel(true);
    }
    // pause for QA
    const qaStatic = getQueryParam('qaStatic');
    if (qaStatic && qaStatic !== null) {
      // pause
      props.autoplay = false;
    }
  }, []);
  return showCarousel ? <TheCarousel {...props} /> : null;
};

/*
 * (1) default export is normal component ready to use (2) withInfiniteCarousel is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  Component,
  'InfiniteCarousel',
  variants
);

export default memo(Styled);

export const withInfiniteCarousel = (props: Props) =>
  memo(withCombinedProps(Styled, props));
