import React from 'react';
import { useAuth } from '../Components/AuthContext'; // Adjust the path as necessary
import React from 'react';
import { useAuth } from '../Components/AuthContext'; // Adjust the path as necessary

const ProfileSettingsPage = () => {
    const { user, updateProfile, changePassword, deleteAccount } = useAuth();
    const handleSubmitUpdate = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const profileData = {
            email: formData.get('email'), // Assuming you're allowing email updates
            email: formData.get('email'), // Assuming you're allowing email updates
            username: formData.get('username'),
        };
        await updateProfile(profileData);
        await updateProfile(profileData);
    };
    const handleSubmitPasswordChange = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            await changePassword(formData.get('currentPassword'), formData.get('newPassword'));
            setMessage('Password changed successfully.');
            setErrorMessage('');
        } catch (error) {
            // Adjust this based on the actual structure of the error response
            const errorMessage = error.response?.data?.error || 'Failed to change password.';
            setErrorMessage(errorMessage);
            setMessage('');
        }
    };
    

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            await deleteAccount();
            await deleteAccount();
        }
    };

    return (
        <div>
            <h2>Profile Settings</h2>
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
