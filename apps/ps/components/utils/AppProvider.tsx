import { useEffect } from 'react';
import uiState, { uiStateType } from 'state/uiState';
import ThemeProvider from './ThemeProvider';

const AppProvider = ({ children }) => {
  const ui = uiState((state) => state as uiStateType);
  useEffect(() => {
    /*
     * Toggle color scheme (global UI state is remembered in localStorage)
     */
    window.document.body.dataset.bgcolor = ui.colorSchemes[ui.colorSchemeIndex];
    /*
     * Track user interactions with the page (for analytics)
     */
    window.addEventListener('click', () => {
      ui.clicksIncrement();
    });
  }, [ui.colorSchemeIndex]);

  /*
   * The pageContext will be available globally, set by each page.
   * It holds meta data for branding, page titles/subtitles, A/B variants, etc.
   */
  return <ThemeProvider>{children}</ThemeProvider>;
};

export default AppProvider;
