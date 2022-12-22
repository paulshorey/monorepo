import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';

const args = {};

export const InputMui = Template.bind({});
InputMui.argTypes = {};
InputMui.args = args;

export default {
  title: 'Form/InputMui',
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
