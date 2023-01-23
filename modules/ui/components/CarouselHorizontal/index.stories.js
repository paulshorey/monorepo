import { Component } from '.';
import Template, { code } from './_story';
// import description from './_story.md';
// import { argTypes } from '@techytools/ui/helpers/storybook_args';
// import variants from './styles';

// const variantKeys = Object.keys(variants);
const args = {};

export const CarouselHorizontal = Template.bind({});
// CarouselHorizontal.argTypes = argTypes({ localVariants: variantKeys });
CarouselHorizontal.args = args;

export default {
  title: 'Layout/CarouselHorizontal',
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
