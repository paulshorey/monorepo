import style_to_string from '@techytools/ui/helpers/style_to_string';
import { styleProps, ssProp } from '@techytools/ui/types/styles';

type Props = {
  /**
   * All the props that were passed to your component. Style props are prefixed with "ss".
   */
  props: styleProps;
  /**
   * The "stylesheet" written in JS. It must have at least a "default" key, which returns a string or function that accepts props as first parameter and returns a string.
   */
  variants: {
    default: ssProp;
    [key: string]: ssProp;
  };
};

export default ({ props, variants }: Props): string => {
  const { variant } = props;

  // styled strings
  let styleString = '';

  // default variant
  if (variants.default) {
    styleString += `\n${style_to_string(variants.default, props)}\n`;
  }
  // custom variants
  if (variant && variants[variant]) {
    styleString += `\n${style_to_string(variants[variant], props)}\n`;
  }

  // Cleanup used props that should not go on the DOM element
  delete props.variant;

  /*
   * return
   */
  return styleString;
};
