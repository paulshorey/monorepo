import React, { forwardRef, memo, HTMLAttributes, ReactElement } from 'react';
import variants from './styles';
import { Props as BlockProps } from '@techytools/ui/components/Block';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import styleProps from '@techytools/ui/types/styles';
import withStyles from '@techytools/ui/hooks/withStyles';

export type Props = {
  image: ReactElement;
  title: ReactElement;
  text: ReactElement;
  as?: BlockProps['as'];
} & styleProps &
  HTMLAttributes<HTMLDivElement>;

/**
 * IMPORTANT:
 * title, text, and image must each contain exactly one React JSX child. DO NOT USE the React.Fragment <></>
 */
export const Component = (props: Props, ref: any) => {
  const { image, text, title, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      <div className="Grid4TitleTextImage-title">{title}</div>
      <div className="Grid4TitleTextImage-text">{text}</div>
      <div className="Grid4TitleTextImage-image">{image}</div>
    </div>
  );
};

/*
 * (1) default export is normal component ready to use (2) withGrid4TitleTextImage is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'Grid4TitleTextImage',
  variants
);
export default memo(Styled);

export const withGrid4TitleTextImage = (props: Props) =>
  memo(withCombinedProps(Styled, props));
