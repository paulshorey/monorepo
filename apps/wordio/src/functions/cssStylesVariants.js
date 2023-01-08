import { css } from '@emotion/react';

/**
 * For marketing component library components. Manages which variant or variants to use, and shows which styles have been used.
 *
 *    Instead of cryptic classNames:
 *    ```
 *        <p class="css-wo3rmh">
 *    ```
 *    This function will generate descriptive classNames like this:
 *    ```
 *        <p class="css-101jjxbx6-Text-default_large-custom">
 *    ```
 *    This is very important for debugging, refining, and redeveloping marketing pages.
 *        In the above example...
 *            `Text` is the name of the component, so we can track it back to the correct React file.
 *            `default_large` is the list of variants used, in order, separated by underscore. Without this, it's very difficult to tell where the styles came from.
 *            `custom` means that some custom CSS was passed in, from the parent component. So, not only using variant styles. You can imagine it could get confusing if you're trying to find where a style came from, but do not know about this.
 *
 *    @param styles {object|array<string|function|object>} - Object or Array of EmotionCSS styles (or simple CSS strings).
 *        Key/index should match the tag/variant/variants values (**required**)
 *    @param theme {any} - whatever your style functions expect (optional)
 *    @param component {string} - name of the React component (optional, but recommended, for debugging CSS in DevTools)
 *    @param tag {string} - HTML TagName of the rendered element (optinoal, will be treated as a variant if matching style exists)
 *    @param variant {string} - key in styles object (optional, will be used if exists, gracefully ignored if not exist)
 *    @param variants {array} - list of multiple variant, each same as variant prop (optional)
 *    @param customCSS {string|function|object} - EmotionCSS style or simple CSS string.
 */
export default ({
  styles = {},
  theme = null,
  tag = '',
  customCSS = '',
  variant = '',
  variants = [],
  component = '',
}) => {
  let labelList = {};
  if (component) {
    labelList[component.toLowerCase()] = component;
  }
  // always use default style if exists
  if (styles.default) {
    variants.unshift('default');
  }
  let variantCSS = '';
  // use tagName as variant
  if (tag && !variants.includes(tag)) {
    variants.push(tag);
  }
  // accept one $variant{string} or multiple $variants{array}
  if (variant) {
    variants.push(variant);
  }
  // compose all styles (cascading), set custom label
  for (let variant of variants) {
    labelList[variant.toLowerCase().trim()] = variant;
    if (variant in styles) {
      if (styles[variant]) {
        variantCSS += emotionCSSToString(styles[variant], theme);
      }
    }
  }
  let label = [...Object.values(labelList)].join('_');
  // remove "-customCSS-customCSS"
  let customStr = '';
  if (customCSS) {
    customStr += emotionCSSToString(customCSS, theme);
    if (customStr && customStr !== ';') {
      variantCSS += customStr;
      label += '-custom';
    }
  }
  // return Emotion CSS, with custom label
  return css`
    label: ${label};
    ${variantCSS};
  `;
};

/**
 * Like the default function, but simplifies the inputs - No variants, just use ALL possible styles.
 *    Inputs are the same as useVariants, but not all are supported.
 */
// export const cssStylesVariantss = ({ tag, styles, theme }) => {
//   // useVariants() "variants" prop assigns specificity to later items.
//   // This is reverse of EmotionCSS array, which gives specificity to first item.
//   let variants = Object.keys(styles).reverse();
//   return useVariants({ tag, styles, variants, theme });
// };

/**
 * EmotionCSS style is unpredictable format. This standardizes it to string.
 */
const emotionCSSToString = (style, theme) => {
  let variantCSS = '';
  if (style?.styles) {
    variantCSS += (style?.styles?.replace(/label:(.*?);/g, '') || '') + ';';
  } else if (typeof style === 'function') {
    variantCSS += (style(theme)?.styles.replace(/label:(.*?);/g, '') || '') + ';';
  } else if (typeof style === 'string') {
    variantCSS += (style?.replace(/label:(.*?);/g, '') || '') + ';';
  }
  return variantCSS;
};
