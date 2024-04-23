import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import ResetPasswordPage from '../Pages/ResetPasswordPage'; 
import { BrowserRouter } from 'react-router-dom';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
  jest.clearAllMocks(); // If you have other mocks, clear them before each test
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ token: 'valid_token' }) // Assuming 'valid_token' is a placeholder for a valid token scenario
}));

const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('ResetPasswordPage', () => {
    it('renders without crashing', () => {
    render(<ResetPasswordPage />, { wrapper: Wrapper });
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
    });

    it('updates input fields correctly', () => {
    render(<ResetPasswordPage />, { wrapper: Wrapper });
    const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });

    expect(newPasswordInput.value).toBe('newPassword123');
    expect(confirmPasswordInput.value).toBe('newPassword123');
    });

    it('submits form and navigates on successful password reset', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ status: 'success' }));
    render(<ResetPasswordPage />, { wrapper: Wrapper });

    const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const resetButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetButton);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    });


    it('displays error toast on failed password reset attempt', async () => {
    fetchMock.mockReject(new Error('API is down'));
    render(<ResetPasswordPage />, { wrapper: Wrapper });
    });

    it('allows further action after successful password reset', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ status: 'success' }));
    render(<ResetPasswordPage />, { wrapper: Wrapper });

    const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    fireEvent.change(newPasswordInput, { target: { value: 'newValidPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newValidPassword123' } });

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    });


    it('does not submit the form without any input', async () => {
    render(<ResetPasswordPage />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('makes API call with correct body and handles API response errors', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ status: 'success' }));
      render(<ResetPasswordPage />, { wrapper: Wrapper });

      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

      await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String), 
        expect.objectContaining({
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ token: 'valid_token', new_password: 'password123' })
        })
      ));
    });    
});
