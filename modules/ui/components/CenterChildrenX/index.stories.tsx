import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@techytools/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);
const args = {
  textcolor: 'accent',
};

export const CenterChildrenX = Template.bind({});
CenterChildrenX.argTypes = argTypes({ localVariants: variantKeys });
CenterChildrenX.args = args;

export default {
  title: 'Layout/CenterChildrenX',
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
