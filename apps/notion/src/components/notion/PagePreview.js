import React, { useState, useEffect } from 'react';
import { css, useTheme } from '@emotion/react';
import Text from 'src/components/notion/TextBlock';

const style = (theme, color) => css`
  padding-left: 0.75rem;
  padding-right: 0.75rem;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0.385em;
    margin-bottom: 0;
  }
`;

/*
 * DECIDE HOW TO RENDER THIS PAGE
 * 1. has children - then show first paragraph, then navigation links
 * 2. first paragraph is a URL - then show site preview, with custom title/description
 * 3. else - show simple text preview
 * Always show "read more" link at the bottom, to encourage clicking to open and read more.
 */

const PagePreview = ({ page }) => {
  if (!page) {
    return null;
  }
  const theme = useTheme();
  // console.log('ChildPage', page);
  const pages2 = [];
  if (page.blocks) {
    for (const block2 of page.blocks) {
      if (block2.child_page) {
        const page2 = block2.child_page;
        pages2.push({
          id: page2.id,
          url: page2.url,
          title: page2.title,
        });
      }
    }
  }
  return (
    <div className="notionPagePreview" css={style(theme)}>
      <h4>
        <a href={'/blog' + page.url}>{page.title}</a>
      </h4>
      {page.paragraph && <Text block={page.paragraph} />}
      {!!pages2 && !!pages2.length && (
        <p>
          {pages2.map((page, pi) => (
            <span key={pi}>
              {' '}
              <a href={'/blog' + page.url}>{page.title}</a> |
            </span>
          ))}
        </p>
      )}
    </div>
  );
};

export default PagePreview;
