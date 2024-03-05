// src/Components/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Use the useNavigate hook

    const login = (userData, token) => {
        // Assuming the userData and token are provided when this function is called
        localStorage.setItem('token', token); // Store the token in localStorage
        setUser(userData); // Update the user state
        navigate('/'); // Redirect the user to the homepage
    };

    const logout = () => {
        localStorage.removeItem('token'); // Remove the token from localStorage
        setUser(null); // Clear the user state
        navigate('/'); // Redirect to the login page
    };

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData); // Set the user state with the fetched data
                    navigate('/'); // Redirect to the homepage upon successful fetch
                } else {
                    console.error("Failed to fetch user data");
                    logout(); // Logout the user if fetch is unsuccessful
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                logout(); // Logout the user on error
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const value = { user, setUser, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
