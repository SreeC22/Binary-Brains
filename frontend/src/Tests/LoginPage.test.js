import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../Components/AuthContext'; // Adjust the path to your AuthProvider
import LoginPage from '../Pages/LoginPage'; // Adjust the path to your LoginPage component
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mocking the useNavigate hook used within the LoginPage component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: () => jest.fn(),
}));

// Mocking environmental variables
process.env.REACT_APP_BACKEND_URL = 'http://localhost:5000';
beforeEach(() => {
    fetch.resetMocks();
  });
  
describe('Email Format and Password Validation', () => {
    beforeEach(() => {
      // Mocking environmental variables
      process.env.REACT_APP_BACKEND_URL = 'http://localhost:5000';
  
      // Mocking the useNavigate hook used within the LoginPage component
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
        useNavigate: () => jest.fn(),
      }));
    });
    test('displays error message for invalid email format', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Simulate typing an invalid email
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'userexample.com');

    // Simulate form submission
    const submitButton = screen.getByRole('button', { name: /Login/i });
    userEvent.click(submitButton);

    // Assert that an error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Email is invalid/i)).toBeInTheDocument();
    });
  });
  beforeEach(() => {
    fetch.resetMocks();
  });
  
  test('accepts a valid email format without displaying an error message', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Simulate typing a valid email
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'user@example.com');

    // Simulate form submission
    const submitButton = screen.getByRole('button', { name: /Login/i });
    userEvent.click(submitButton);

    // Assert that no error message for the email is displayed
    await waitFor(() => {
      expect(screen.queryByText(/Email is invalid/i)).not.toBeInTheDocument();
    });
  });
  beforeEach(() => {
    fetch.resetMocks();
  });
  
  test('displays an error message for a password that is too short', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  
    // Find and fill out the password field with a short password
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'short');
  
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Login/i });
    userEvent.click(submitButton);
  
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  beforeEach(() => {
    fetch.resetMocks();
  });
  
  test('validates that the confirm password field matches the password field', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  
    // Click to switch to registration view
    const switchToRegisterLink = screen.getByText(/Not registered\? Create account now/i);
    await userEvent.click(switchToRegisterLink);
  
    // Wait for the "Confirm Password" input to ensure we're in registration mode
    // This assumes confirm password input is present only in registration mode
    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password1234'); // intentionally mismatched for the test
  
    // Find the Register button by text and assume it's enabled when in registration mode
    const registerButton = screen.getByRole('button', { name: /Register/i });
    userEvent.click(registerButton);
  
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Passwords must match/i)).toBeInTheDocument();
    });
  });
  beforeEach(() => {
    fetch.resetMocks();
  });
  test('handles successful registration', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'Registration successful', user: { id: '123', email: 'user@example.com' } }), { status: 200 });
  
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  
    const switchToRegisterLink = screen.getByText(/Not registered\? Create account now/i);
    await userEvent.click(switchToRegisterLink);
  
    const nameInput = screen.getByLabelText(/Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByTestId('passwordInput');
    const confirmPasswordInput = screen.getByTestId('confirmPasswordInput');
    
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
  
    const registerButton = screen.getByRole('button', { name: /Register/i });
    userEvent.click(registerButton);
  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/register'), expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"email":"user@example.com"')
      }));
    });
  
  });

  test('handles failed registration due to duplicate email', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'Email already exists.' }), { status: 409 });
  
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  
    // Trigger registration mode by clicking the link to switch to the registration view.
    const switchToRegisterLink = screen.getByText(/Not registered\? Create account now/i);
    userEvent.click(switchToRegisterLink);
  
    // Fill in the registration form
    const nameInput = screen.getByLabelText(/Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByTestId('passwordInput');
    const confirmPasswordInput = screen.getByTestId('confirmPasswordInput');
  
    await userEvent.type(nameInput, 'Jane Doe');
    await userEvent.type(emailInput, 'duplicate@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
  
    // Submit the form
    const registerButton = screen.getByRole('button', { name: /Register/i });
    userEvent.click(registerButton);
  
    // Await the appearance of the error message directly without assuming its role.
    // This relies on the text content of the message, ensuring the message is visible and correct.
    await waitFor(() => {
      expect(screen.getByText(/Email already exists./i)).toBeInTheDocument();
    }, { timeout: 10000 }); // Increase the timeout if necessary, but focus on ensuring the message appears quickly.
  });
  
  
});
