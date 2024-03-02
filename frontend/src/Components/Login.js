import React from 'react';

const Login = () => {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_BACKEND_URL + '/oauth_callback';

  const handleGoogleLogin = () => {
    const state = Math.random().toString(36).substring(2, 15); // Generate a random state string
    const scope = "openid email profile";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&prompt=consent`;

    window.location.href = authUrl; // Redirect the user to Google's OAuth page
  };
  const handleGitHubLogin = () => {
    const state = Math.random().toString(36).substring(2, 15);
    const scope = "openid email profile";

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_GITHUB_REDIRECT_URI}&scope=user`;

    window.location.href = authUrl;
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleGitHubLogin}>Login with GitHub</button>
    </div>
  );
};

export default Login;
