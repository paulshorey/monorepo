import React from 'react';
import cconsole from '@ps/cconsole';

const Text = ({ data }) => {
  if (!data) {
    return null;
  }
  if (!data?.rich_text) {
    return <code>Text !data.rich_text</code>;
  }

  if (data.rich_text) {
    return (
      <p>
        {data.rich_text.map((text) => {
          if (!text) return null;
          let className = '';
          for (let key in text.annotations) {
            if (text.annotations[key]) {
              className += ` ${key}`;
            }
          }
          return <span className={className}>{text.text?.content || ''}</span>;
        })}
      </p>
    );
  }

  // always return something
  return null;
};

export default Text;
