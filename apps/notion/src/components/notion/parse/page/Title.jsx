import React from 'react';
import cconsole from '@ps/cconsole';

const Title = ({ data }) => {
  if (!data) {
    return null;
  }
  if (!data?.title) {
    return <code>Title !data.title</code>;
  }

  if (data.title) {
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

export default Title;
