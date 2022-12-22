import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';

let rendered = 0;
const Frame = ({ host, path, frame, ...props }) => {
  const router = useRouter();
  const [errorMessage, set_errorMessage] = useState('');
  const [renderUrl, set_renderUrl] = useState('');
  const [width, height, caption] = frame;
  rendered++;
  useEffect(() => {
    /*
     * Validate path/host before rendering preview iframe.
     */
    if (!host || host.substring(0, 4) !== 'http') {
      set_errorMessage('Invalid host');
      set_renderUrl('');
      return;
    }
    if (!path || path.substring(0, 1) !== '/') {
      path = '/' + path;
    }
    if (path === router.pathname && host === window.location.host) {
      set_renderUrl('');
      set_errorMessage(
        'did not render preview because (host + path === current page url) --- page can not render self'
      );
      return;
    }
    /*
     * Valid. Set the preview url:
     */
    let url = host + path;
    if (url.includes('?')) {
      url += '&';
    } else {
      url += '?';
    }
    url += 'previewSize=' + width + 'x' + height;
    set_errorMessage('');
    set_renderUrl(host + path);
  }, [host, path]);
  /*
   * Not valid
   */
  if (errorMessage) {
    return <code>{errorMessage} </code>;
  }
  if (!renderUrl) {
    return null;
  }
  return (
    <div
      {...props}
      className={
        'frame' + (width > 930 ? ' isDesktop' : width > 500 ? ' isTablet' : '')
      }
      css={css`
        width: ${width > 930
          ? width * 0.525
          : width > 500
          ? width * 0.6
          : width * 0.67}px;
      `}
    >
      <div
        css={css`
          font-size: 12px;
          padding: 5px 0 0 5px;
          color: #ccc !important;
        `}
      >
        {caption}
        <span
          css={css`
            color: #666;
            padding-left: 1.5rem;
          `}
        >
          {rendered}
        </span>
      </div>

      <iframe
        title={'preview' + rendered}
        src={renderUrl}
        width={width}
        height={height}
        frameBorder={0}
      />
    </div>
  );
};

export default Frame;
