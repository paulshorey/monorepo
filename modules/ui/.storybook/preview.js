import ThemeProvider from '@ps/ui/components/ThemeProvider';
import React, { useEffect } from 'react';
import { themes } from '@storybook/theming';
import Block from '@ps/ui/components/Block';
import '@ps/ui/styles/colors.css';

export const parameters = {
  docs: {
    theme: themes.dark,
  },
};

export const decorators = [
  (Story, context) => {
    /**
     * Inject a CSS string as a <style> tag into the DOM of the window.top frame
     */
    const topCSS = `
  .search-field { 
    top: -1px;
    left: -2px;
  }
  .sidebar-header * {
    display:none !important;
  }
  .sidebar-header:before {
    content: 'Harmony UI';
    color: white;
    font-size: 1.01rem;
    font-weight: bold;
    white-space: nowrap;
    opacity: 0.5;
  }
  `;

    const selfCSS = `
    .docs-story > * { 
      margin: 0 !important;
      padding: 0 !important;
     }

  `;

    useEffect(() => {
      // TOP FRAME
      {
        let el = window.top?.document.getElementById(
          'storybook-customized-css'
        );
        if (!el) {
          const style = document.createElement('style');
          style.id = 'storybook-top-change-css';
          style.innerHTML = topCSS;
          window.top?.document.body.appendChild(style);
        }
      }
      // STORY FRAME
      {
        let el = window.selfCSS?.document.getElementById(
          'storybook-customized-css'
        );
        if (!el) {
          const style = document.createElement('style');
          style.id = 'storybook-selfCSS-change-css';
          style.innerHTML = selfCSS;
          window.selfCSS?.document.body.appendChild(style);
        }
      }
    }, []);

    // console.log('story preview');
    return (
      <ThemeProvider>
        <Block
          variant="bggradient"
          ss="position:relative;overflow:hidden;margin: -30px -20px;"
        >
          <Story {...context} />
        </Block>
      </ThemeProvider>
    );
  },
];

// export const globalTypes = {
//   theme: {
//     name: "Theme",
//     title: "Theme",
//     description: "Theme for your components",
//     defaultValue: "light",
//     toolbar: {
//       icon: "paintbrush",
//       dynamicTitle: true,
//       items: [
//         { value: "light", left: "☀️", title: "Light mode" },
//         { value: "dark", left: "🌙", title: "Dark mode" },
//       ],
//     },
//   },
// };
