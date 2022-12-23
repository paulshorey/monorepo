import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@techytools/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);
const args = {
  size: 'lg',
  variant: '',
  round: true,
  loading: false,
  children: 'Button text',
};

export const Button = Template.bind({});
Button.argTypes = {
  size: {
    control: {
      type: 'select',
    },
    options: ['xs', 'sm', 'md', 'lg', 'xl'],
  },
  ...argTypes({ localVariants: variantKeys }),
};
Button.args = args;

export default {
  title: 'Form/Button',
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
