import React, { forwardRef, memo } from 'react';
import CenterChildrenX from '../CenterChildrenX';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import variants from './styles';
import blur from '@techytools/ui/helpers/blur';
import withStyles from '@techytools/ui/hooks/withStyles';
import styleProps from '@techytools/ui/types/styles';

export type Props = {
  /**
   * The content of the dropdown
   */
  menu?: React.ReactNode;
  /**
   * Trigger the dropdown on click instead of hover
   */
  click?: boolean;
  /**
   * Align the dropdown to the left edge of the children
   */
  left?: boolean;
  /**
   * Align the dropdown to the top edge of the children
   */
  right?: boolean;
  /**
   * Align the dropdown to the top edge of the children
   */
  top?: boolean;
  /**
   * Align the dropdown to the bottom edge of the children
   */
  bottom?: boolean;

  children?: any;
} & styleProps;

/**
 * IMPORTANT: This component does NOT add tabIndex to any elements. You can add `tabIndex: 0` yourself to the target and/or to menu items to make them keyboard accessible.
 */
export const Component = (props: Props, ref: any) => {
  const { menu, children, ...rest } = props;
  const handleClick = () => {
    setTimeout(blur, 300);
  };
  return (
    <div {...rest} ref={ref}>
      {children}
      {!props.left && !props.right ? (
        <CenterChildrenX
          className="Dropdown__menuContainer"
          onClick={handleClick}
        >
          <div tabIndex={0} className="Dropdown__menu" role="menu">
            {menu}
          </div>
        </CenterChildrenX>
      ) : (
        <div
          tabIndex={0}
          className="Dropdown__menu Dropdown__menuContainer"
          role="menu"
          onClick={handleClick}
        >
          {menu}
        </div>
      )}
    </div>
  );
};

/*
 * (1) default export is normal component ready to use (2) withDropdown is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'Dropdown',
  variants
);

export default memo(Styled);

export const withDropdown = (props: Props) =>
  memo(withCombinedProps(Styled, props));
