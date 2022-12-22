/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
import '@emotion/react';

import { Theme as EmotionTheme } from 'src/styles/theme';
// Add theme type to useTheme()
declare module '@emotion/react' {
  export interface Theme extends EmotionTheme {}
}

// Support css prop on all HTML elements
declare module 'react' {
  interface HTMLAttributes<T> {
    css?: Interpolation<EmotionTheme>;
  }
}
