import React, { createContext, useContext, useEffect, useState } from 'react';
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
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            alert("Authentication required.");
            return;
        }
    
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/user/update_profile`, 
                { email, username },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // Assuming response.data contains the updated user object
            setUser(response.data); // Update local user state
            // Optionally, refresh user data to ensure UI is in sync with the backend
            await fetchUserData(); 
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert(error.response.data.message || "An error occurred while updating the profile.");
        }
    };
    
    

    const changePassword = async (currentPassword, newPassword) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token'); // Retrieve the token directly
        console.log("Token for password change: ", token); // Debug log
    
        if (!token) {
            console.error("Token not found");
            throw new Error("Authentication token not found.");
        }
    
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/change_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Use the directly retrieved token
                },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Non-JSON response or error received:", errorText);
                throw new Error(`Failed to change password: ${errorText}`);
            }
    
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error in changePassword:", error);
            throw error;
        }
    };
    const deleteAccount = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 
        console.log("Token for account deletion: ", token); 
    
        if (!token) {
            console.error("Token not found");
            alert("Authentication token not found. Please log in again.");
            return;
        }
    
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error received:", errorText);
                alert(`Failed to delete account: ${errorText}`);
                return;
            }
    
            console.log("Account deleted successfully");
            setUser(null); 
            navigate('/login'); 
        } catch (error) {
            console.error("Failed to delete account:", error);
            alert("An error occurred while trying to delete the account. Please try again.");
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