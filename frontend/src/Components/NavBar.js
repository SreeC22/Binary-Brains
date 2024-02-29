import React from 'react';

const Navbar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
  
    const handleLogout = () => {
      localStorage.removeItem('user');
      // Redirect to login page or home page
    };
  
    return (
      <nav>
        {user ? (
          <div>
            <span>Welcome, {user.name}!</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>You are not logged in.</div>
        )}
      </nav>
    );
  };

export default Navbar;