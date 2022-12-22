import React from 'react';
import mq from './mq';

export type Theme = {
  RouterLink?: React.ReactElement | null;
} & Record<string, any>;

const theme: Theme = {
  // colors: {}, // use "css properties" in colors.css instead
  RouterLink: null,
  mq,
  sizes: {
    card: {
      borderRadius: 0.4,
    },
    buttonsAndInputs: {
      borderRadius: 0.4,
      height: {
        xs: 1.5,
        sm: 1.95,
        md: 2.33,
        lg: 2.55,
        xl: 3,
      },
      paddingX: {
        xs: 0.67,
        sm: 0.75,
        md: 1,
        lg: 1,
        xl: 1.5,
      },
      fontSize: {
        xs: 0.75,
        sm: 0.85,
        md: 1,
        lg: 1.125,
        xl: 1.5,
      },
    },
  },
};

export default theme;
