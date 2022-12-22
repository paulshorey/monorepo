import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@ps/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);
const args = {
  variant: 'transparentDark',
  code: `import React, { useState } from "react";

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
  showNumbers: true,
  language: 'jsx',
  prismTheme: {},
  ss: 'margin:0;',
};

export const Code = Template.bind({});
Code.argTypes = argTypes({ localVariants: variantKeys });
Code.args = args;

export default {
  title: 'Content/Code',
  component: Component,
  parameters: {
    viewMode: 'docs',
    previewTabs: {
      canvas: { hidden: true },
    },
    docs: {
      description: {
        component: description,
      },
      source: {
        code,
      },
    },
  },
};
