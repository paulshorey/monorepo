import '@testing-library/jest-dom/extend-expect';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import useOutsideClick from '.';

afterEach(() => {
  jest.clearAllMocks();
});

const Component = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  const { ref } = useOutsideClick(() => setIsOpen(!isOpen));

  return (
    <div>
      <button data-testid="outside" />
      {isOpen && (
        <div data-testid="inside" ref={ref} style={{ height: 50, width: 50 }}>
          TEST ME
        </div>
      )}
    </div>
  );
};

describe('Hook: useOutsideClick', () => {
  it('calls callback function if you click outside', async () => {
    render(<Component />);
    await act(async () => {
      await waitFor(() =>
        expect(screen.queryByTestId('inside')).toBeInTheDocument()
      );
      await waitFor(() => fireEvent.click(screen.getByTestId('outside')));
      await waitFor(() =>
        expect(screen.queryByTestId('inside')).not.toBeInTheDocument()
      );
    });
  });

  it('does not fire on inside clicks', async () => {
    render(<Component />);

    await act(async () => {
      await waitFor(() =>
        expect(screen.queryByTestId('inside')).toBeInTheDocument()
      );
      await waitFor(() => fireEvent.click(screen.getByTestId('inside')));
      await waitFor(() =>
        expect(screen.getByTestId('inside')).toBeInTheDocument()
      );
    });
  });
});
