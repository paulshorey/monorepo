import React, { useState, useEffect } from 'react';
import { css, useTheme } from '@emotion/react';
import Card from 'src/components/html/Card';

const style = (theme) => css`
  width: 100%;
  max-width: 1223px;
  margin-top: 4px;
  margin-bottom: 4px;
  //background:white; // keep it grey, remember to put it into its own page, so it can be searchable
`;

export default ({ sitePreview }) => {
  const theme = useTheme();
  if (!sitePreview) return null;
  let { title, description, image, url, icon, canonical, site_name } = sitePreview;
  if (!site_name) {
    site_name = url ? url.replace(/www\.|https:\/\/|http:\/\//g, '') : '';
  }

  return (
    <div className="notionSitePreview" css={style}>
      <div>
        <div
          css={css`
            display: flex;
          `}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={canonical || url}
            css={css`
              display: block;
              color: inherit;
              text-decoration: none;
              flex-grow: 1;
              min-width: 0px;
            `}
          >
            <div
              className="notion-focusable"
              role="button"
              tabIndex="-1"
              css={css`
                user-select: none;
                transition: background 20ms ease-in 0s;
                cursor: pointer;
                width: 100%;
                display: flex;
                flex-wrap: wrap-reverse;
                align-items: stretch;
                text-align: left;
                overflow: hidden;
                border: 1px solid rgba(55, 53, 47, 0.16);
                border-radius: 3px;
                position: relative;
                color: inherit;
                fill: inherit;
              `}
            >
              <div
                css={css`
                  flex: 4 1 180px;
                  padding: 12px 14px 14px;
                  overflow: hidden;
                  text-align: left;
                `}
              >
                <div
                  css={css`
                    font-size: 14px;
                    line-height: 20px;
                    color: rgb(55, 53, 47);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    min-height: 24px;
                    margin-bottom: 2px;
                  `}
                >
                  {title}
                </div>
                <div
                  css={css`
                    font-size: 12px;
                    line-height: 16px;
                    color: rgba(55, 53, 47, 0.6);
                    height: 32px;
                    overflow: hidden;
                  `}
                >
                  {description}
                </div>

                <div
                  css={css`
                    display: flex;
                    margin-top: 6px;
                  `}
                >
                  <img
                    alt={`Preview site: ${url}`}
                    src={icon || image}
                    loading="lazy"
                    css={css`
                      width: 16px;
                      height: 16px;
                      min-width: 16px;
                      margin-right: 6px;
                    `}
                  />
                  <div
                    css={css`
                      font-size: 12px;
                      line-height: 16px;
                      color: rgb(55, 53, 47);
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    `}
                  >
                    {site_name}
                  </div>
                </div>
              </div>
              <div
                css={css`
                  flex: 1 1 180px;
                  display: block;
                  position: relative;
                `}
              >
                <div
                  css={css`
                    position: absolute;
                    inset: 0px;
                  `}
                >
                  <div
                    css={css`
                      width: 100%;
                      height: 100%;
                    `}
                  >
                    <img
                      alt={`Preview site: ${url}`}
                      src={image}
                      loading="lazy"
                      css={css`
                        display: block;
                        object-fit: cover;
                        border-radius: 1px;
                        width: 100%;
                        height: 100%;
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
