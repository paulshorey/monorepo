import { Component } from '.';
import Template, { code } from './_story';
import description from './_story.md';

export const SelectMui = Template.bind({});
SelectMui.args = {};

export default {
  title: 'Form/SelectMui',
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
