import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@techytools/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);
const args = {
  ss: 'min-height: 400px;',
};

export const CenterChildrenY = Template.bind({});
CenterChildrenY.argTypes = argTypes({ localVariants: variantKeys });
CenterChildrenY.args = args;

export default {
  title: 'Layout/CenterChildrenY',
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
