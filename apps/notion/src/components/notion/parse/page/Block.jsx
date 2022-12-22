import React from 'react';
import cconsole from '@ps/cconsole';
import Text from './Text';

const Block = ({ data }) => {
  if (!data) {
    return null;
  }
  if (!data.type || !data[data.type]) {
    return <code>Block !data.type</code>;
  }
  // rich text type
  if (data[data.type].rich_text) {
    return <Text data={data[data.type]} />;
  }
  // child page
  if (data.type === 'child_page') {
  }
  console.log('Block data[data.type]', [data.type], data[data.type]);
  // blocks
  if (data.blocks) {
    for (let block of data.blocks) {
      parsed.children.push(() => Block({ data: block }));
    }
  }

  // always return something
  return null;
};

export default Block;
