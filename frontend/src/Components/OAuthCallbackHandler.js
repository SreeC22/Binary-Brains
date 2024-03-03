import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallbackHandler = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state');

    // Optionally validate the state parameter here if you're using it for CSRF protection

    if (code) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/oauth_callback?code=${encodeURIComponent(code)}`, {
        method: 'GET',
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to exchange code for user information.');
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem('user', JSON.stringify(data)); // Consider security implications
        navigate('/'); // Redirect to home page or dashboard
      })
      .catch(error => {
        console.error('Error:', error);
        setError('Failed to login. Please try again.');
        // Optionally navigate to an error page or show an error message
      });
    } else {
      setError('No authorization code found. Please try again.');
      // Optionally navigate to an error page or show an error message
    }
  }, [navigate]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Processing OAuth callback...</div>;
};

export default OAuthCallbackHandler;
