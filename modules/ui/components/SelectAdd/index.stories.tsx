import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@ps/ui/helpers/storybook_args';
import variants from '../Select/styles';

const variantKeys = Object.keys(variants);

export const SelectAdd = Template.bind({});
SelectAdd.args = {
  showSearch: true,
  placeholder: 'Select a person',
  addPlaceholder: 'Add new person',
  values: ['Jack', 'Lucy', 'Tom'],
  value: undefined,
};
SelectAdd.argTypes = {
  size: {
    control: {
      type: 'select',
    },
    options: ['xs', 'sm', 'md', 'lg', 'xl'],
  },
  ...argTypes({ localVariants: variantKeys }),
};

export default {
  title: 'Form/SelectAdd',
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
