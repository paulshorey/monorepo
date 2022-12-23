import React, { forwardRef, memo } from 'react';
import styleProps from '@techytools/ui/types/styles';
import variants from '@techytools/ui/components/Select/styles';
import { OptionProps as AntOptionProps } from 'antd/es/select';
import { Select as AntSelect, SelectProps as AntSelectProps } from 'antd';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import withStyles from '@techytools/ui/hooks/withStyles';

// Select props
export type Props = {
  /**
   * Used to set padding/fontSize/height/line-height.
   * Used only in styles. Not passed to Ant component.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
} & styleProps &
  Omit<AntSelectProps, 'size'>;

/**
 * Select component (includes multi-select and type tags functionality) powered by Ant Design component.
 */
export const Component = (props: Props, ref: any) => {
  // eslint-disable-next-line
  const { size, ...rest } = props;
  return <AntSelect {...rest} ref={ref} />;
};

/*
 * (1) default export is normal component ready to use (2) withSelect is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'Select',
  variants
);

export default memo(Styled);

export const withSelect = (props: Props) =>
  memo(withCombinedProps(Styled, props));

/*
 * ACCESSORY EXPORTS:
 * For convenience, export Option, so user doesn't have to import from antd.
 * Unfortunately, Ant Design options can not be styled. So, styleProps can not be added.
 */
export const Option = AntSelect.Option;
export type OptionProps = AntOptionProps;
// export const OptionGroup = AntSelect.OptGroup;
// export type OptionGroupProps = typeof AntSelect.OptGroup;
