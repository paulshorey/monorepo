import { Component } from '.';
import _story, { code } from './_story';
// import description from './_story.md';
import { argTypes } from '@ps/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);

export const Dropdown = _story.bind({});
Dropdown.argTypes = argTypes({ localVariants: variantKeys });
Dropdown.args = {};

export default {
  title: 'Layout/Dropdown',
  component: Component,
  parameters: {
    viewMode: 'docs',
    previewTabs: {
      canvas: { hidden: true },
    },
    docs: {
      description: {
        component: undefined,
      },
      source: {
        code,
      },
    },
  },
};
