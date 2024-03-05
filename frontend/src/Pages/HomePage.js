import React from 'react';
import { useAuth } from '../Components/AuthContext'; // Adjust path as necessary

const HomePage = () => {
  const { user } = useAuth(); // Access user from context

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome to the HomePage</h1>
          <p>Email: {user.email}</p>
          {/* Display more user information here if needed */}
        </div>
      ) : (
        <h1>Please log in</h1>
      )}
    </div>
  );
};

export default HomePage;
