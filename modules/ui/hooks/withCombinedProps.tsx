import React from 'react';
import objects_add_values from '@ps/fn/io/objects/objects_add_values';

/**
 * Predefine default props for a component. Then, use the modified component normally, pass more unique props to the instanace. The predefined and instnace props will be combined. Use for any component from anywhere, even 3rd party libraries.
 * Usage:
 * import Inline from '@ps/ui/components/Inline';
 * const Heading = withCombinedProps(Inline, {
    as: 'h2',
    ss: 'margin:0;',
  });
 * <Heading ss="unique styles here do not override the default ss prop, but add to it">👋</Heading>
 */
const withCombinedProps = (
  /**
   * The React component to wrap in HOC default props. Can be any component, including a styled component, even 3rd party library widgets. If you want to pass ref to it, then it must be a forwardRef component. This HOC does not add forwardRef or memo or anything like that. It just adds default props, then adds more props later.
   */
  Component: any,
  /**
   * Default props to predefine for all instances of this component. This HOC returns a new component which you can then use in your JSX. Pass individual unique props to that.
   */
  props1: Record<string, any>
) => {
  return (
    /**
     * Props for the unique instance.
     */
    props2: Record<string, any>
  ) => {
    const combinedProps = objects_add_values(
      props1,
      props2,
      ';',
      ['children'],
      ['ss', 'className', 'variant'],
      'props'
    );
    return <Component {...combinedProps}>{props2.children}</Component>;
  };
};

export default withCombinedProps;
