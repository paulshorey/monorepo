import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@ps/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);
const args = {
  ss: '',
  variant: '',
  textcolor: 'cta',
  shade: '',
};

export const Link = Template.bind({});
Link.argTypes = argTypes({ localVariants: variantKeys });
Link.args = args;

export default {
  title: 'Nav/Link',
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
