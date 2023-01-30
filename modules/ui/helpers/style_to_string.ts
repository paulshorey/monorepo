import obj_has_key from '@techytools/ui/helpers/io/obj_has_key';
import { styleProp } from '@techytools/ui/types/styles';

/**
 * Accepts SCSS string, function that accepts props and returns string, or an array of either.
 * Returns all outputs flattened into one string, for passing to Emotion/StyledComponents template literals.
 */
export default function style_to_string(
  /**
   * EmotionJS css prop type. Will be converted to string. Or string. Or array of strings.
   */
  style: styleProp,
  /**
   * props, just like in a @emotion/styled function
   */
  props?: Record<string, any>,
  /**
   * options object to pass to the style function as 2nd argument (if it is a function. Otherwise ignored)
   */
  options?: Record<string, boolean>
): string {
  let output = '';
  if (!style) {
    return output;
  }
  // if simple string
  if (typeof style === 'string') {
    output += style;
  }
  // if array
  else if (Array.isArray(style)) {
    style.forEach((item) => {
      output += style_to_string(item, props, options);
    });
  }
  // if function
  else if (typeof style === 'function') {
    output += style_to_string(style(props, options));
  }
  // if emotion is SerializedStyles type
  else if (obj_has_key(style, 'styles') && typeof style.styles === 'string') {
    // extract just the style string from EmotionJS object
    // @ts-ignore // tsFixMe // Already checked if var is function or object. How to type Typescript var with more than one type?
    output += style.styles;
  }

  // cleanup classNames generated by Emotion
  // output = output.replace(/label:(.*?);/g, '').replace(/([;]+)/g, ';');

  return ';' + output + ';';
}
