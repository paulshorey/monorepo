import React, { useState, useEffect } from 'react';
import { css, useTheme } from '@emotion/react';

const style = (theme, color) => css``;

export default ({ children, link }) => {
  const theme = useTheme();
  if (!children) return null;
  let href = link?.url || '#';
  let target = link?.url ? '_blank' : '_self';
  return (
    <a className="notionLink" css={style(theme)} href={href} target={target}>
      {children}
    </a>
  );
};
