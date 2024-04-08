import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequestReset from './RequestReset';
import '@testing-library/jest-dom';

const mockToast = jest.fn();
// Mocking useToast from Chakra UI directly
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'), // Preserve other exports
  useToast: () => mockToast, // Return mockToast when useToast is called
}));

// Mocking fetch API
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  mockToast.mockClear(); // Clear the mock implementation of toast
});

describe('RequestReset Component', () => {
  test('renders without crashing', () => {
    render(<RequestReset />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
  });

  test('updates email input value', async () => {
    render(<RequestReset />);
    const inputElement = screen.getByPlaceholderText('Enter your email');
    await userEvent.type(inputElement, 'test@example.com');
    expect(inputElement.value).toBe('test@example.com');
  });

  test('displays SUCCESS on successful form submission', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    render(<RequestReset />);
    const inputElement = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await userEvent.type(inputElement, 'test@example.com');
    userEvent.click(submitButton);

    await waitFor(() => 
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Request Successful',
        description: 'If an account exists for this email, you will receive reset instructions.',
        status: 'success',
      }))
    );
  });

  test('displays ERROR on failed form submission', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    render(<RequestReset />);
    const inputElement = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await userEvent.type(inputElement, 'fail@example.com');
    await userEvent.click(submitButton);

    // Check that mockToast was called with the expected error message
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      status: 'error',
    })));
  });

  test('does not call API with empty email', async () => {
    render(<RequestReset />);
    const inputElement = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    // Leave the email input empty
    await userEvent.type(inputElement, '');
    userEvent.click(submitButton);

    await waitFor(() => 
      expect(fetch).not.toHaveBeenCalled(),
      {timeout: 500} // Specify a timeout to wait for assertions to pass. Adjust as necessary.
    );
  });
});
