import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Use the useNavigate hook

    const login = (userData, token, remember_me) => {
        if (remember_me) {
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
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
    const updateProfile = async ({ email, username }) => {
        try {
            const response = await axios.put('/api/user/update_profile', { email, username }, {
                headers: {
                    Authorization: `Bearer ${user.token}`, // Assuming the token is stored in the user object
                },
            });
            // Assuming the backend returns the updated user object
            setUser(response.data);
        } catch (error) {
            throw new Error(error.response.data.message);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/change_password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          });
      
          if (!response.ok) {
            // Attempt to read response as text if not OK
            const errorText = await response.text();
            console.error("Non-JSON response or error received:", errorText);
            throw new Error(`Failed to change password: ${errorText}`);
          }
      
          // Parse JSON only if response is OK
          const data = await response.json();
          return data;
        } catch (error) {
          console.error("Error in changePassword:", error);
          throw error;
        }
      };
      

    const deleteAccount = async () => {
        try {
            await axios.delete('/api/user/delete', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            // Handle what happens after the account is successfully deleted
            // For example, log the user out, clear the user state, or redirect to a login page
            setUser(null);
        } catch (error) {
            throw new Error(error.response.data.message);
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
        changePassword,  // Ensure this is included
        deleteAccount,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};