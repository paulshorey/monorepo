import { addons } from '@storybook/addons';
import { create } from '@storybook/theming/create';
import DEFAULT_THEME from './storybook-default-theme';

addons.setConfig({
  isFullscreen: false,
  showNav: true,
  showPanel: false,
  panelPosition: 'right',
  enableShortcuts: true,
  showToolbar: true,
  theme: create(DEFAULT_THEME),
  selectedPanel: undefined,
  initialActive: '',
  sidebar: {
    showRoots: true,
    collapsedRoots: ['other'],
  },
  toolbar: {
    title: { hidden: true },
    zoom: { hidden: true },
    eject: { hidden: true },
    copy: { hidden: true },
    fullscreen: { hidden: false },
  },
});
