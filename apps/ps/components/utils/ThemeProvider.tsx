import {
  ThemeProvider as StyledThemeProvider,
  Global,
  css,
} from '@emotion/react';

// JavaScript theme variables (like padding, height, font-size):
// Set colors in colors.css so they can support "cascading" (inherit from parent)
// Alternatively, it's possible to set colors in JavaScript, then generate CSS and pass to <Global/>
import theme from 'styles/theme';

// Optional - global styles:
import fonts from '@techytools/ui/styles/global/fonts';
import html from '@techytools/ui/styles/global/html';
import classes from '@techytools/ui/styles/global/classes';
import global from 'styles/global';

const ThemeProvider = ({ children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      <Global
        styles={css`
          ${fonts(theme)};
          ${html(theme)};
          ${classes(theme)};
          ${global(theme)};
        `}
      />
      {children}
    </StyledThemeProvider>
  );
};

export default ThemeProvider;
