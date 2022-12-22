import { Component } from '.';
import _box, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@ps/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);

export const Block = _box.bind({});
Block.argTypes = argTypes({ localVariants: variantKeys });
Block.args = {
  className: 'card articleX',
  textcolor: 'purple',
  bggradient: 'light',
  as: 'section',
};

export default {
  title: 'Base/Block',
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
