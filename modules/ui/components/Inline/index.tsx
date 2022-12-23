import React, { memo, HTMLAttributes, forwardRef } from 'react';
import { styledTags, styleProps } from '@techytools/ui/types/styles';
import variants from './styles';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import withStyles from '@techytools/ui/hooks/withStyles';

export type Props = {
  /**
   * HTML element tag name to render. Styles and functionality will not be changed, but the HTML tag will affect the default styles.
   */
  as?: styledTags;
} & styleProps &
  HTMLAttributes<HTMLDivElement>;

/*
 * Base element (like a div) for rendering a block of content
 */
export const Component = (props: Props, ref: any) => {
  const { as, ...rest } = props;
  const Tag = `${as || 'span'}`;
  // @ts-ignore - Tag is a div or other valid html element
  return <Tag ref={ref} {...rest} />;
};

/*
 * (1) default export is normal component ready to use (2) withInline is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'Inline',
  variants
);

export default memo(Styled);

export const withInline = (props: Props) =>
  memo(withCombinedProps(Styled, props));
