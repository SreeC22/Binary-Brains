import React, { useState } from 'react';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = `${process.env.REACT_APP_BACKEND_URL}/oauth_callback`;
  const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
  const GITHUB_REDIRECT_URI = process.env.REACT_APP_GITHUB_REDIRECT_URI;

  const initiateGoogleOAuth = () => {
    setIsLoading(true);
    const state = Math.random().toString(36).substring(2, 15);
    const scope = "openid email profile";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&state=${state}&prompt=consent`;

    window.location.href = authUrl;
  };

  const initiateGithubOAuth = () => {
    setIsLoading(true);
    const state = Math.random().toString(36).substring(2, 15);
    const scope = "user";
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=${scope}&state=${state}`;

    window.location.href = authUrl;
  };

  return (
    <div>
      <h2>Login or Register</h2>
      <button onClick={initiateGoogleOAuth} disabled={isLoading}>
        Login/Register with Google
      </button>
      <button onClick={initiateGithubOAuth} disabled={isLoading}>
        Login/Register with GitHub
      </button>
      {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default Login;
