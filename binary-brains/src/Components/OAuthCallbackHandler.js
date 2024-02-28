import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallbackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state');
    // You might want to validate the state here to ensure it matches what you sent

    if (code) {
      // Here you would typically send the code to your backend to exchange it for tokens
      console.log('Authorization code:', code);
      // After handling the authorization code, redirect the user as needed
      navigate('/'); // Example redirection after handling the callback
    }
  }, [navigate, location]);

  return (
    <div>
      Processing OAuth callback...
    </div>
  );
};

export default OAuthCallbackHandler;

