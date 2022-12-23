import React, { forwardRef, memo, HTMLAttributes } from 'react';
import variants from './styles';
import styleProps, { styledTags } from '@techytools/ui/types/styles';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import withStyles from '@techytools/ui/hooks/withStyles';

export type Props = {
  /**
   * HTML element tag name to render. Styles and functionality will not be changed, but the HTML tag will affect the default styles.
   */
  as?: styledTags;
} & styleProps &
  HTMLAttributes<HTMLDivElement>;

export const Component = (props: Props, ref: any) => {
  const { as, children, ...rest } = props;
  const Tag = `${as || 'div'}`;
  return (
    // @ts-ignore - Tag is a div or other valid html element
    <Tag ref={ref} {...rest}>
      <div>{children}</div>
    </Tag>
  );
};

/*
 * (1) default export is normal component ready to use (2) withCenterChildrenY is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'CenterChildrenY',
  variants
);

export default memo(Styled);

export const withCenterChildrenY = (props: Props) =>
  memo(withCombinedProps(Styled, props));
