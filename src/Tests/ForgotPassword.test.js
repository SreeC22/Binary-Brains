import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPassword from '../Pages/ForgotPassword'; // Adjust the import path as needed
import { BrowserRouter } from 'react-router-dom';

// Mocking modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
global.fetch = require('jest-fetch-mock');

describe('ForgotPassword', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('updates email state on input change', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    const input = screen.getByPlaceholderText('Enter your email');
    await userEvent.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('calls the API and navigates on successful form submission', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    fetch.mockResponseOnce(JSON.stringify({ message: 'Success' }), { status: 200 });

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('Enter your email');
    const button = screen.getByRole('button', { name: 'Send Reset Link' });

    await userEvent.type(input, 'test@example.com');
    userEvent.click(button);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
  });

  it('shows an error toast on failed form submission', async () => {
    fetch.mockReject(new Error('Failed to send'));

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('Enter your email');
    const button = screen.getByRole('button', { name: 'Send Reset Link' });

    await userEvent.type(input, 'test@example.com');
    userEvent.click(button);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });
});
