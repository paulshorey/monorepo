/* eslint-disable react/display-name */
import '@testing-library/jest-dom/extend-expect';

import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation((query) => ({
    // deprecated
    addEventListener: jest.fn(),

    addListener: jest.fn(),

    dispatchEvent: jest.fn(),

    matches: false,

    media: query,

    onchange: null,

    removeEventListener: jest.fn(),
    // deprecated
    removeListener: jest.fn(),
  })),
  writable: true,
});

const localStorageMock = (() => {
  let store = {};

  return {
    clear() {
      store = {};
    },
    getItem(key) {
      return store[key] || null;
    },
    removeItem(key) {
      delete store[key];
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Needed for React-Modal to work properly in testing
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createPortal: (node) => node,
  };
});

jest.mock('react-text-mask', () => (props) => <input type="text" {...props} />);

jest.mock('react-dates', () => ({
  DayPickerRangeController: 'mockDayPickerRangeController',
}));
