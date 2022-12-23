// @ts-nocheck
import React, { useEffect, forwardRef, memo } from 'react';
import HorizontalCarousel from './script';
import { Props as BlockProps } from '@techytools/ui/components/Block';
import variants from './styles';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import withStyles from '@techytools/ui/hooks/withStyles';

type Props = {
  /**
   * Must be a React.Fragment of multiple elements. Do not pass just one element. `<> <div>1</div> <div>2</div> </>` is valid, `<div> <div>1</div> <div>2</div> </div>` is not.
   */
  children?: React.ReactNode;
  /**
   * To customize the arrows, pass a React.Fragment with two elements. The first element will be the left arrow, the second element will be the right arrow. They must have classNames "__prev" and "__next" respectively. Like this: `<> <div className="__prev">&lt;</div> <div className="__next">&gt;</div> </>`
   */
  arrows?: React.ReactNode;
} & BlockProps;

/**
 * Two good things about this carousel: (1) It works for any children elements (divs, images, paragraphs, etc), and they don't have to be all the same width! Other carousels usually require all children to be the same width. (2) Prev/Next arrows are built in, for zero configuration setup. But, you can pass custom props.arrows
 */
export const Component = (props: Props, ref: any) => {
  const { arrows, children, ...rest } = props;
  const carouselRef = React.useRef(ref);
  useEffect(() => {
    const carousel = new HorizontalCarousel(carouselRef.current);
    return () => {
      carousel.end();
    };
  }, []);
  return (
    <div ref={carouselRef} {...rest}>
      <div className="__slides">{children}</div>
      {!!arrows && <div className="__arrows">{arrows}</div>}
    </div>
  );
};

/*
 * (1) default export is normal component ready to use (2) withHorizontalCarousel is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'HorizontalCarousel',
  variants
);

export default memo(Styled);

export const withHorizontalCarousel = (props: Props) =>
  memo(withCombinedProps(Styled, props));
