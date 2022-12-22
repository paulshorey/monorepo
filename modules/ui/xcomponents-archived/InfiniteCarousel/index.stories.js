import { Component } from '.';
import Template, { code } from './_story';
// import description from './_story.md';
// import { argTypes } from '@ps/ui/helpers/storybook_args';
// import variants from './styles';

// const variantKeys = Object.keys(variants);
// const args = {};

export const InfiniteCarousel = Template.bind({});
// InfiniteCarousel.argTypes = argTypes({ localVariants: variantKeys });
// InfiniteCarousel.args = args;

export default {
  title: 'Layout/InfiniteCarousel',
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
