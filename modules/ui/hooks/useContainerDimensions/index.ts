import React, { useEffect, useState } from 'react';

export type Props = React.RefObject<any>;

type Dimensions = { height: number; width: number };

/**
 * Hook to return dimensions of a container when give a useRef object
 */
export const useContainerDimensions = (ref: Props): Dimensions => {
  const getDimensions = (): Dimensions => ({
    height: ref.current.offsetHeight,
    width: ref.current.offsetWidth,
  });

  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getDimensions());
    };

    if (ref.current) {
      setDimensions(getDimensions());
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref]);

  return dimensions;
};
