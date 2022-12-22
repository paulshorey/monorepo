import React from 'react';

const useOutsideClick = (handler: () => void) => {
  const savedHandler = React.useRef(handler);

  const [ref, setRef] = React.useState<Element | null>(null);

  const handleClick = React.useCallback(
    (e: MouseEvent) => {
      if (ref && !ref?.contains(e.target as Element)) {
        savedHandler.current();
      }
    },
    [ref]
  );

  const refSetter = React.useCallback((node) => {
    setRef(node);
  }, []);

  React.useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  return { ref: refSetter };
};

export default useOutsideClick;
