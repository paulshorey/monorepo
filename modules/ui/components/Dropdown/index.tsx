import React, { forwardRef, memo } from 'react';
import CenterChildrenX from '../CenterChildrenX';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import variants from './styles';
import blur from '@techytools/ui/helpers/blur';
import withStyles from '@techytools/ui/hooks/withStyles';
import styleProps from '@techytools/ui/types/styles';
import { styledTags } from '@techytools/ui/types/styles';

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
  /**
   * The tabIndex of the dropdown menu. Defaults to undefined
   */
  tabIndex?: number;
  /**
   * HTML element tag name to render. Styles and functionality will not be changed, but the HTML tag will affect the default styles.
   */
  as?: styledTags;
  children?: any;
} & styleProps;

/**
 * IMPORTANT: This component does NOT add tabIndex to any elements, unless you pass props.tabIndex.
 * You can add `tabIndex: 0` yourself to the target and/or to menu items to make them keyboard accessible.
 */
export const Component = (props: Props, ref: any) => {
  const {
    as,
    left,
    right,
    menu,
    children,
    tabIndex = undefined,
    ...rest
  } = props;
  const handleClick = () => {
    setTimeout(blur, 300);
  };
  const Tag = `${as || 'div'}`;
  return (
    // @ts-ignore - Tag is a div or other valid html element
    <Tag {...rest} ref={ref}>
      {children}
      {!left && !right ? (
        <CenterChildrenX
          className="Dropdown__menuContainer"
          onClick={handleClick}
        >
          <div tabIndex={tabIndex} className="Dropdown__menu" role="menu">
            {menu}
          </div>
        </CenterChildrenX>
      ) : (
        <div
          tabIndex={tabIndex}
          className="Dropdown__menu Dropdown__menuContainer"
          role="menu"
          onClick={handleClick}
        >
          {menu}
        </div>
      )}
    </Tag>
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
