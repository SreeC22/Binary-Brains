import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileSettingsPage from './ProfileSettingsPage'; // Adjust the import path as necessary
import { useAuth } from '../Components/AuthContext'; // Adjust the import path as necessary

// Mock useAuth and useToast
jest.mock('../Components/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: jest.fn(() => jest.fn()),
  };
});

describe('ProfileSettingsPage', () => {
  const mockUpdateProfile = jest.fn();
  const mockChangePassword = jest.fn();
  const mockDeleteAccount = jest.fn();
  const user = {
    email: 'user@example.com',
    username: 'testuser',
  };

  beforeEach(() => {
    useAuth.mockImplementation(() => ({
      user,
      updateProfile: mockUpdateProfile,
      changePassword: mockChangePassword,
      deleteAccount: mockDeleteAccount,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { getByText } = render(<ProfileSettingsPage />);
    expect(getByText(/Hello testuser/i)).toBeInTheDocument();
  });

  test('initializes state with user data', () => {
    const { getByDisplayValue } = render(<ProfileSettingsPage />);
    expect(getByDisplayValue(user.email)).toBeInTheDocument();
    expect(getByDisplayValue(user.username)).toBeInTheDocument();
  });

  // Test for updating the profile
test('calls updateProfile with the correct data on form submission', async () => {
    const { getByLabelText, getByText } = render(<ProfileSettingsPage />);
    const emailInput = getByLabelText(/email/i);
    const usernameInput = getByLabelText(/username/i);
    const updateButton = getByText(/update profile/i);

    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    fireEvent.click(updateButton);
  
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        email: 'newemail@example.com',
        username: 'newusername',
      });
    });
  });
  
  // Test for changing the password
  test('calls changePassword with current and new passwords on form submission', async () => {
    const { getByLabelText, getByText } = render(<ProfileSettingsPage />);
    const currentPasswordInput = getByLabelText(/current password/i);
    const newPasswordInput = getByLabelText(/new password/i);
    const changePasswordButton = getByText(/change password/i);
  
    // Simulate user input
    fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass' } });
    fireEvent.click(changePasswordButton);
  
    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('currentpass', 'newpass');
    });
  });
  
  // Test for deleting the account
  test('calls deleteAccount on account deletion confirmation', async () => {
    global.confirm = jest.fn(() => true); // Mock the confirm dialog to return true
    const { getByText } = render(<ProfileSettingsPage />);
    const deleteAccountButton = getByText(/delete account/i);
  
    fireEvent.click(deleteAccountButton);
  
    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
    });
  });
  
});
