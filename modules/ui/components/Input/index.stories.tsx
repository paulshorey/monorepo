import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@techytools/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);
const args = { size: 'sm', round: true };

export const Input = Template.bind({});
Input.argTypes = {
  size: {
    control: {
      type: 'select',
    },
    options: ['xs', 'sm', 'md', 'lg', 'xl'],
  },
  ...argTypes({ localVariants: variantKeys }),
};
Input.args = args;

export default {
  title: 'Form/Input',
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
