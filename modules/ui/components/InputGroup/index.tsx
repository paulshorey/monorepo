import React, { forwardRef, memo, HTMLAttributes } from 'react';
import variants from './styles';
// import { Props as ButtonProps } from '@techytools/ui/components/Button';
// import { Props as InputProps } from '@techytools/ui/components/Input';
import styleProps from '@techytools/ui/types/styles';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import withStyles from '@techytools/ui/hooks/withStyles';

export type Props = styleProps & // ButtonProps & // InputProps & // TODO: would be nice to figure out how to forward props to children elements!
  HTMLAttributes<HTMLDivElement>;

export const Component = (props: Props, ref: any) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
};

/*
 * (1) default export is normal component ready to use (2) withInputGroup is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'InputGroup',
  variants
);

export default memo(Styled);

export const withInputGroup = (props: Props) =>
  memo(withCombinedProps(Styled, props));
