import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';
// import { argTypes } from '@ps/ui/helpers/storybook_args';
// import variants from './styles';

// const variantKeys = Object.keys(variants);
const args = {};

export const Modal = Template.bind({});
// Modal.argTypes = argTypes({ localVariants: variantKeys });
Modal.args = args;

export default {
  title: 'Content/Modal',
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
