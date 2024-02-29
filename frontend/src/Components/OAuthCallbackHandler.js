import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallbackHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    if (code) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/oauth_callback?code=${encodeURIComponent(code)}`, {
        method: 'GET', // Assuming your backend expects a GET request
      })
      .then(response => response.json())
      .then(data => {
        console.log('User info received:', data);
        // Store the user info in localStorage or state management library
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/'); // Redirect to home page or dashboard
    })
    
      .catch(error => console.error('Error:', error));
    }
  }, [navigate]);

  return <div>Processing OAuth callback...</div>;
};

export default OAuthCallbackHandler;
