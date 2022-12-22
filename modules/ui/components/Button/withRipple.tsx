// @ts-nocheck
import React, { createRef } from 'react';

const withRipple = ({ children }) => {
  let timerId;
  const ref = createRef() as React.RefObject<HTMLSpanElement>;
  return (
    <span
      ref={ref}
      role="none"
      onMouseDown={(e) => {
        if (!ref || !ref.current) {
          return;
        }
        clearTimeout(timerId);
        const ripple = ref.current.querySelector('.withRipple');
        if (!ripple) {
          return;
        }
        const size = ref.current.offsetWidth;
        const pos = ref.current.getBoundingClientRect();
        const x = e.pageX - pos.left - size;
        const y = e.pageY - pos.top - size;
        ripple.style =
          'top:' +
          y +
          'px; left:' +
          x +
          'px; width: ' +
          size * 2 +
          'px; height: ' +
          size * 2 +
          'px;';
        ripple.classList.remove('withRipple_active');
        ripple.classList.remove('withRipple_start');
        timerId = setTimeout(() => {
          ripple.classList.add('withRipple_start');
          setTimeout(() => {
            ripple.classList.add('withRipple_active');
          });
        });
      }}
      onMouseUp={(e) => {
        const ripple = ref.current.querySelector('.withRipple');
        if (!ripple) {
          return;
        }
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          ripple.classList.remove('withRipple_active');
          ripple.classList.remove('withRipple_start');
        }, 700);
      }}
    >
      <span className="withRipple" />
      {children}
    </span>
  );
};
export default withRipple;
