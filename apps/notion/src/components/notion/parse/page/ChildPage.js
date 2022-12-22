import React, { useState, useEffect } from 'react';
import { css, useTheme } from '@emotion/react';
import ChildPagePreview from './ChildPagePreview';

const style = (theme, color) => css``;

export default ({ page }) => {
  if (!page) return null;
  const theme = useTheme();
  // console.log('ChildPage', page);
  let pages2 = [];
  if (page.blocks) {
    for (let block2 of page.blocks) {
      if (block2.child_page) {
        let page2 = block2.child_page;
        pages2.push({
          id: page2.id,
          url: page2.url,
          title: page2.title,
        });
      }
    }
  }
  return (
    <p className="notionPageChild" css={style(theme)}>
      <ChildPagePreview page={page} />
    </p>
  );
};
