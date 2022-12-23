import {
  ThemeProvider as StyledThemeProvider,
  Global,
  css,
} from '@emotion/react';

// JavaScript theme variables (like padding, height, font-size):
// Set colors in colors.css so they can support "cascading" (inherit from parent)
// Alternatively, it's possible to set colors in JavaScript, then generate CSS and pass to <Global/>
import theme from '@techytools/ui/styles/theme';

// Optional - global styles:
import fonts from '@techytools/ui/styles/global/fonts';
import html from '@techytools/ui/styles/global/html';
import classes from '@techytools/ui/styles/global/classes';
import antd5 from '@techytools/ui/styles/global/antd5';

// Optional - MaterialUI Theme (required if using MUI components)
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
// Optional - Customize Material UI theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgba(255,255,255,1)',
    },
    secondary: {
      main: 'rgba(255,255,255,1)',
    },
    background: {
      default: 'rgba(0,0,0,1)',
      paper: 'hsla(22deg 3% 12% / 0.85)',
    },
  },
});

const ThemeProvider = ({ children }) => {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <StyledThemeProvider theme={theme}>
        <Global
          styles={css`
            ${fonts(theme)};
            ${html(theme)};
            ${classes(theme)};
            ${antd5(theme)};
          `}
        />
        {children}
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
