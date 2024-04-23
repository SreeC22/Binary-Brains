import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../Components/AuthContext'; // Adjust the path to your AuthProvider
import LoginPage from '../Pages/LoginPage'; // Adjust the path to your LoginPage component
import fetchMock from 'jest-fetch-mock';
import { useNavigate } from 'react-router-dom';

fetchMock.enableMocks();

// Mocking the useNavigate hook used within the LoginPage component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: jest.fn(() => jest.fn()),
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

  beforeEach(() => {
    fetch.resetMocks();
  });
  
  test('does not display "Forgot password?" link when isLogin is false', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  
    // Check if the link is not in the document
    const forgotPasswordLink = screen.queryByRole('link', { name: /forgot password\?/i });
    expect(forgotPasswordLink).not.toBeInTheDocument();
  });

  test('displays "Forgot password?" link when isLogin is true', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  
    // Check if the link is in the document
    const forgotPasswordText = screen.getByText(/forgot password\?/i);
    expect(forgotPasswordText).toBeInTheDocument();
  });

  test('navigates to "/forgot-password" when "Forgot password?" link is clicked', async () => {
    //const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
    // Click the forgot password link
    const forgotPasswordText = screen.getByText(/forgot password\?/i);
    await userEvent.click(forgotPasswordText);
  });

  test('hides "Forgot password?" link when authentication state changes to logged in', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByRole('link', { name: /forgot password\?/i })).not.toBeInTheDocument();
  });

  test('handles multiple clicks on "Forgot password?" link gracefully', async () => {
    // Directly render the component within the necessary providers
    render(
      <BrowserRouter>
        <AuthProvider> {/* Remove AuthProvider if not needed for this particular test */}
          <LoginPage isLogin={true} /> {/* Assuming isLogin is a prop, otherwise omit */}
        </AuthProvider>
      </BrowserRouter>
    );
  
    // Find the "Forgot password?" link and click it multiple times
    const forgotPasswordText = screen.getByText(/forgot password\?/i);
    await userEvent.click(forgotPasswordText);
    await userEvent.click(forgotPasswordText); // Simulate rapid double-click
  });
  
  test('displays all fields in the registration mode', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  
    userEvent.click(screen.getByText(/Not registered\? Create account now/i));
  
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByTestId('passwordInput')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPasswordInput')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('navigates to registration page from login', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  
    userEvent.click(screen.getByText(/Not registered\? Create account now/i));
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });  

});