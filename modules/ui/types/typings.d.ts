/*
 * Work in progress...
 */
import { styleProps, ssProp as ssPropType } from './styles';
import themeType from './theme';

declare global {
  type props = styleProps;
  type theme = themeType;
  type ssProp = ssPropType;
}

declare module '*.md' {
  const content: string;
  export = content;
}
