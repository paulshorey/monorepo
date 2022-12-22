import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
import { argTypes } from '@ps/ui/helpers/storybook_args';
import variants from './styles';

const variantKeys = Object.keys(variants);
const args = {
  variant: 'titleImageTextImage',
};

export const Grid4TitleTextImage = Template.bind({});
Grid4TitleTextImage.argTypes = argTypes({ localVariants: variantKeys });
Grid4TitleTextImage.args = args;

export default {
  title: 'Layout/Grid4TitleTextImage',
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
