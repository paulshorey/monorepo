import { css } from '@emotion/react';

export const composeCSS = ({ tag, theme, customCSS, variant, variants = [], presets }) => {
  // if (tag === 'header') console.log('composeCSS()', composeCSS);
  let variantCSS = '';
  // use tagName as variant
  if (!variants.includes(tag)) {
    variants.push(tag);
  }
  // accept one $variant{string} or multiple $variants{array}
  if (variant) {
    variants.push(variant);
  }
  // if (tag === 'header') console.warn('variants', variants);
  // compose CSS of all variants
  for (let variant of variants) {
    if (variant in presets) {
      variantCSS += presets[variant](theme).styles + ';';
    }
  }
  // add custom CSS
  return css`
	${variantCSS};
	${customCSS};
  `;
};
