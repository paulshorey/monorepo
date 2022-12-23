import React, { forwardRef } from 'react';
import { useTheme, ClassNames } from '@emotion/react';
import colorscheme_dataset from '@techytools/ui/helpers/colorscheme_dataset';
import { styleProps } from '@techytools/ui/types/styles';
import style_string_from_props from '@techytools/ui/helpers/style_string_from_props';
import style_string_from_variants from '@techytools/ui/helpers/style_string_from_variants';

export default (Component: any, componentName: string, variants: any) =>
  forwardRef(({ ...props }: styleProps, ref: any) => {
    /*
     * TODO: Refactor. This logic is run every time the component or its children receives different props.
     * Maybe it's ok. But needs more testing. To fix:
      1) Manipulate component props only once on initial compile (add theme, data-component or className attribute based on component name so it can be found in dev tools, data-colorscheme, data-bggradient, etc.)
      2) Wrap in styled() component outside the function so styled-components library can take care of restyling and rerendering.
     */
    props.theme = useTheme();
    const inlineStyles = style_string_from_props({
      props,
    });
    const variantStyles = style_string_from_variants({
      props,
      variants,
    });
    const colorScheme = colorscheme_dataset(props);
    // cleanup after styles have been generated and applied
    delete props.theme;
    return (
      <ClassNames>
        {({ css, cx }) => (
          <Component
            {...props} // all props, minus custom style props which were used and removed by functions above
            {...colorScheme} // cascading foreground/background colors - dataset attributes
            ref={ref}
            className={cx(
              componentName || '', // default className label from component constructor (in this library)
              props.className, // custom classNames passed to the component
              css(`&.${componentName} {
                ${variantStyles};
              }
              `), // less specificity than inlineStyles, but more than others here
              css(`&.${componentName} {
                ${inlineStyles};
              }
              `) // more specificity than any other styles here, but still does not beat nested (child) selectors!
            )}
          />
        )}
      </ClassNames>
    );
  });
