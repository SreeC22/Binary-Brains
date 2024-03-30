import React, { useState } from 'react';
import { useAuth } from '../Components/AuthContext';

const ProfileSettingsPage = () => {
    const { user, updateProfile, changePassword, deleteAccount } = useAuth();
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    if (!user) {
        return <div>Loading user data...</div>;
    }

    const handleSubmitUpdate = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const profileData = {
            email: formData.get('email'),
            username: formData.get('username'),
        };
        try {
            await updateProfile(profileData);
            setMessage('Profile updated successfully.');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to update profile.');
            setMessage('');
        }
    };

    const handleSubmitPasswordChange = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            await changePassword(formData.get('currentPassword'), formData.get('newPassword'));
            setMessage('Password changed successfully.');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to change password.');
            setMessage('');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await deleteAccount();
                // You might want to redirect or log out the user at this point
                setMessage('Account deleted successfully.');
                setErrorMessage('');
            } catch (error) {
                setErrorMessage('Failed to delete account.');
                setMessage('');
            }
        }
    };

    return (
        <div>
            <h2>Profile Settings</h2>
            {message && <div className="success-message">{message}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <form onSubmit={handleSubmitUpdate}>
                <input name="email" type="email" placeholder="Email" defaultValue={user.email} />
                <input name="username" type="text" placeholder="Username" defaultValue={user.username} />
                <button type="submit">Update Profile</button>
            </form>

            <form onSubmit={handleSubmitPasswordChange}>
                <input name="currentPassword" type="password" placeholder="Current Password" required />
                <input name="newPassword" type="password" placeholder="New Password" required />
                <button type="submit">Change Password</button>
            </form>

            <button onClick={handleDeleteAccount}>Delete Account</button>
        </div>
    );
};

export default ProfileSettingsPage;
