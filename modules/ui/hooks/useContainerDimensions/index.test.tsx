import { act, render, waitFor } from 'test-utils/index';
import React from 'react';
import { useContainerDimensions } from '.';

afterEach(() => jest.clearAllMocks());

const renderComponent = () => {
  const Wrapper = () => {
    const ref = React.useRef<HTMLDivElement>(null);

    const { height, width } = useContainerDimensions(ref);

    return (
      <>
        <div
          data-testid="measure"
          ref={ref}
          style={{ height: 200, width: 400 }}
        >
          Hi there
        </div>
        <div data-testid="width">{width}</div>
        <div data-testid="height">{height}</div>
      </>
    );
  };

  return {
    ...render(<Wrapper />),
  };
};

const widthFn = jest.fn();
const heightFn = jest.fn();

Object.defineProperties(window.HTMLElement.prototype, {
  offsetHeight: {
    get() {
      heightFn();
      return 200;
    },
  },
  offsetWidth: {
    get() {
      widthFn();
      return 400;
    },
  },
});

describe('useContainerDimensions - default', () => {
  it('Returns correct values on load', async () => {
    const { getByTestId } = renderComponent();

    // Test
    expect(getByTestId('width')).toHaveTextContent('0');

    await act(async () => {
      await waitFor(() => {
        expect(getByTestId('width')).toHaveTextContent('400');
        expect(getByTestId('height')).toHaveTextContent('200');
        expect(widthFn).toHaveBeenCalledTimes(1);
        expect(heightFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('Returns correct values on resize', async () => {
    const { getByTestId } = renderComponent();

    // Test
    expect(getByTestId('width')).toHaveTextContent('0');

    await act(async () => {
      window.dispatchEvent(new Event('resize'));

      expect(widthFn).toHaveBeenCalledTimes(2);
      expect(widthFn).toHaveBeenCalledTimes(2);
    });
  });
});
