import { Component } from '.';
import _story, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@ps/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);

export const Inline = _story.bind({});
Inline.argTypes = argTypes({ localVariants: variantKeys });
Inline.args = {
  'data-textcolor': 'purple',
  'data-textgradient': true,
};

export default {
  title: 'Base/Inline',
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
