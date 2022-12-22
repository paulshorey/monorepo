import React, { forwardRef, memo, HTMLAttributes } from 'react';
import variants from './styles';
import styleProps from '@ps/ui/types/styles';
import withCombinedProps from '@ps/ui/hooks/withCombinedProps';
import withStyles from '@ps/ui/hooks/withStyles';

export type Props = {
  /**
   * The string to display. Special characters will be automatically escaped when rendered to HTML.
   */
  code?: string;
} & styleProps &
  HTMLAttributes<HTMLDivElement>;

export const Component = (props: Props, ref: any) => {
  const { code, children, ...rest } = props;
  return (
    <code ref={ref} {...rest}>
      <span>{code || children}</span>
    </code>
  );
};

/*
 * (1) default export is normal component ready to use (2) CodeInline is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'Code',
  variants
);

export default memo(Styled);

export const withCodeInline = (props: Props) =>
  memo(withCombinedProps(Styled, props));
