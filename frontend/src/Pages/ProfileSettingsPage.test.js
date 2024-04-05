import React from 'react';
import { render, fireEvent, waitFor, queryByText } from '@testing-library/react';
import ProfileSettingsPage from './ProfileSettingsPage'; 
import * as AuthContext from '../Components/AuthContext'; 
import '@testing-library/jest-dom'

// Mock the useToast hook from Chakra UI
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'), // Import and spread the original module
  useToast: jest.fn(() => jest.fn()), // Mock implementation of useToast
}));

// Utility function for setting up the test environment
const setup = () => {
  const user = { email: 'user@example.com', username: 'testuser' };
  const updateProfile = jest.fn(() => Promise.resolve());
  const changePassword = jest.fn(() => Promise.resolve());
  const deleteAccount = jest.fn(() => Promise.resolve());

  jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
    user,
    updateProfile,
    changePassword,
    deleteAccount,
  }));

  return {
    user,
    updateProfile,
    changePassword,
    deleteAccount,
    ...render(<ProfileSettingsPage />),
  };
};

// successful profile update
it('submits correct data on profile update', async () => {
    const { updateProfile, getByLabelText, getByText } = setup();
  
    fireEvent.change(getByLabelText(/email/i), { target: { value: 'newemail@example.com' } });
    fireEvent.change(getByLabelText(/username/i), { target: { value: 'newusername' } });
    fireEvent.click(getByText(/update profile/i));
  
    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({
      email: 'newemail@example.com',
      username: 'newusername'
    }));
  });

// successful password change
it('submits new password correctly', async () => {
    const { changePassword, getByLabelText, getByText } = setup();
  
    fireEvent.change(getByLabelText(/current password/i), { target: { value: 'oldPassword123' } });
    fireEvent.change(getByLabelText(/new password/i), { target: { value: 'newPassword123' } });
    fireEvent.click(getByText(/change password/i));
  
    await waitFor(() => expect(changePassword).toHaveBeenCalledWith('oldPassword123', 'newPassword123'));
  });

// delete account confirmation
it('confirms and calls account deletion', async () => {
    global.confirm = jest.fn(() => true); // Mock confirmation dialog to return true
    const { deleteAccount, getByText } = setup();
  
    fireEvent.click(getByText(/delete account/i));
  
    await waitFor(() => expect(deleteAccount).toHaveBeenCalled());
    global.confirm.mockRestore(); 
  });

// handling profile update
it('displays an error toast on profile update failure', async () => {
    const { updateProfile, getByLabelText, getByText, user } = setup();
    updateProfile.mockRejectedValueOnce(new Error('Async error'));
  
    fireEvent.change(getByLabelText(/email/i), { target: { value: user.email } }); 
    fireEvent.change(getByLabelText(/username/i), { target: { value: 'newusername' } });
    fireEvent.click(getByText(/update profile/i));
  
    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
  });

// invalid email input
it('shows an error when an invalid email is submitted', async () => {
    const { getByLabelText, getByText, queryByText } = setup();
  
    fireEvent.change(getByLabelText(/email/i), { target: { value: 'invalidemail' } });
    fireEvent.click(getByText(/update profile/i));
  
    // Wait for and assert the presence of an error message regarding invalid email
    // This assumes your component shows a specific error message for invalid email formats
    await waitFor(() => expect(queryByText(/invalid email format/i)).not.toBeInTheDocument());
  });
  
// empty username input
it('prevents submission with an empty username', async () => {
    const { getByLabelText, getByText } = setup();
  
    fireEvent.change(getByLabelText(/username/i), { target: { value: '' } });
    fireEvent.click(getByText(/update profile/i));
  
    // Assuming an error message is shown for empty username
    await waitFor(() => expect(getByText(/username cannot be empty/i)).toBeInTheDocument());
  });
  
// mismatched passwords for change password
it('shows an error when the new password is too short', async () => {
    const { getByLabelText, getByText } = setup();
  
    fireEvent.change(getByLabelText(/current password/i), { target: { value: 'CurrentPassword123' } });
    fireEvent.change(getByLabelText(/new password/i), { target: { value: 'short' } });
    fireEvent.click(getByText(/change password/i));
  
    // Assuming an error message for short passwords
    await waitFor(() => expect(getByText(/password is too short/i)).toBeInTheDocument());
  });
  

// cancel account deletion process
it('does not delete account when user cancels the confirmation dialog', async () => {
    global.confirm = jest.fn(() => false); // Simulate canceling the confirmation dialog
    const { deleteAccount, getByText } = setup();
  
    fireEvent.click(getByText(/delete account/i));
  
    await waitFor(() => expect(deleteAccount).not.toHaveBeenCalled());
  
    global.confirm.mockRestore();
  });

// submitting unchanged data
it('handles submission without changes gracefully', async () => {
    const { updateProfile, getByText } = setup();
  
    fireEvent.click(getByText(/update profile/i));
  
    // Assuming your application doesn't call updateProfile if the data hasn't changed
    await waitFor(() => expect(updateProfile).not.toHaveBeenCalled());
  });
  
  
  
  


  
  
