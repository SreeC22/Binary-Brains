import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Adjust the import path as necessary

const Navbar = () => {
    const { user, setUser } = useAuth(); // Use AuthContext
    const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem('token'); // Clear the token
      setUser(null); // Clear user context
      navigate('/login'); // Redirect to login page
    };

    // Function to extract name or identifier from user object
    const getUserName = (user) => {
      // Example: Extract name, fallback to part of email before '@', or use a default
      return user.name || user.email.split('@')[0] || "User";
    };

    return (
        <nav>
            {user ? (
                <div>
                    <span>Hi {getUserName(user)}</span> {/* Greet user */}
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <button onClick={() => navigate('/login')}>Login</button>
            )}
        </nav>
    );
};

export default Navbar;
