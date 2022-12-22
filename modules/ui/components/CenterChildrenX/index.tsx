import React, { forwardRef, memo, HTMLAttributes } from 'react';
import variants from './styles';
import styleProps from '@ps/ui/types/styles';
import withCombinedProps from '@ps/ui/hooks/withCombinedProps';
import withStyles from '@ps/ui/hooks/withStyles';

export type Props = styleProps & HTMLAttributes<HTMLDivElement>;

export const Component = (props: Props, ref: any) => {
  return <div ref={ref} {...props} />;
};

/*
 * (1) default export is normal component ready to use (2) withCenterChildrenX is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'CenterChildrenX',
  variants
);

export default memo(Styled);

export const withCenterChildrenX = (props: Props) =>
  memo(withCombinedProps(Styled, props));
