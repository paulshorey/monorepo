import { useEffect } from 'react';

export default () => {
  // runs once after element is mounted
  useEffect(() => {
    if (typeof window === 'object') {
      // @ts-ignore
      const el = window.document.querySelector(
        '.docblock-code-toggle:not(.docblock-code-toggle--expanded)'
      );
      // @ts-ignore
      el && el.click && el.click();
    }
  }, []);
};
