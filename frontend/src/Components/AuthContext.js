// src/Components/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const fetchUserData = async () => {
        // Assuming you store a token in localStorage after login
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
                    setUser(userData);
                } else {
                    console.error("Failed to fetch user data");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const value = { user, setUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
