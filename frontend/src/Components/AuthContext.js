// src/components/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const login = async (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                logout();
                return;
            }
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    logout();
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                logout();
            }
        };

        fetchUserData();
    }, []);

    // Update user profile
    const updateProfile = async (profileData) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/update_profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });
            if (response.ok) {
                // Optionally, update the user state with new profile data
                alert('Profile updated successfully');
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    // Change user password
    const changePassword = async (currentPassword, newPassword) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/change_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (response.ok) {
                alert('Password changed successfully. Please log in again.');
                logout(); // Consider logging the user out after password change
            } else {
                alert('Failed to change password');
            }
        } catch (error) {
            console.error("Error changing password:", error);
        }
    };

    // Delete user account
    const deleteAccount = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                alert('Account deleted successfully');
                logout(); // Log the user out and clear state
            } else {
                alert('Failed to delete account');
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    const value = {
        user, login, logout, updateProfile, changePassword, deleteAccount
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
