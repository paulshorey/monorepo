import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@techytools/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);
const args = {
  code: '',
  textcolor: 'purple',
  bgcolor: 'purple',
};

export const CodeInline = Template.bind({});
CodeInline.argTypes = argTypes({ localVariants: variantKeys });
CodeInline.args = args;

export default {
  title: 'Content/CodeInline',
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
