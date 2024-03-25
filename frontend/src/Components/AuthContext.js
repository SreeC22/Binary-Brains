import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

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
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/profile`, {
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

    useEffect(() => {
        fetchUserData();
    }, []);


    const value = { user, setUser, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};