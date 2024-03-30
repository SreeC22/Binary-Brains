import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const login = async (userData, token, rememberMe) => {
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
        setUser(userData);
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const fetchUserData = async () => {
        const token = getToken();
        if (token) {
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
        }
    };

    const updateProfile = async (profileData) => {
        const token = getToken();
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });
            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
            } else {
                throw new Error('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        const token = getToken();
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (response.ok) {
                // You might want to logout the user or prompt them to login again
            } else {
                throw new Error('Failed to change password.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
        }
    };

    const deleteAccount = async () => {
        const token = getToken();
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/account`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    logout(); // It's important to logout the user after account deletion
                } else {
                    throw new Error('Failed to delete account.');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const value = { 
        user, 
        setUser, 
        login, 
        logout, 
        updateProfile, 
        changePassword, 
        deleteAccount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
