import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallbackHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    console.log('OAuth code:', code); // Check if the code is correctly retrieved
    if (code) {
      const url = `${process.env.REACT_APP_BACKEND_URL}/oauth_callback?code=${encodeURIComponent(code)}`;
      console.log('Fetching from:', url); // Verify the fetch URL
      fetch(url, { method: 'GET' })
        .then(response => {
          console.log('Response received:', response); // Inspect the raw response
          return response.json();
        })
        .then(data => {
          console.log('Data:', data); // Inspect the parsed data
          localStorage.setItem('user', JSON.stringify(data)); // Store user info
          navigate('/'); // Redirect to home page
        })
        .catch(error => console.error('Error:', error));
    }
  }, [navigate]);
};

export default OAuthCallbackHandler;
