import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_BACKEND_URL + '/oauth_callback';

  const handleGoogleLogin = () => {
    const state = Math.random().toString(36).substring(2, 15);
    const scope = "openid email profile";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&prompt=consent`;

    window.location.href = authUrl;
  };

  const handleGitHubLogin = () => {
    const state = Math.random().toString(36).substring(2, 15);
    const scope = "openid email profile";

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_GITHUB_REDIRECT_URI}&scope=user`;

    window.location.href = authUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_BACKEND_URL}/${isLogin ? 'login' : 'register'}`;
    const payload = {
      email,
      password,
      ...(isLogin ? {} : { name }),
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log(data); // Add this line to log the response data
  
      if (isLogin) {
        if (response.ok) {
          navigate('/');
        } else {
          alert('Login failed. Please check your credentials.');
        }
      } else {
        if (response.ok) {
          alert('Registration successful. Please log in.');
          setIsLogin(true);
        } else {
          if (data.error === 'UserAlreadyExists') {
            alert('User already registered. Please login.');
          } else {
            alert('Registration failed. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div>
        {isLogin ? (
          <>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit">Login</button>
            </form>
            <p>Not registered? <button onClick={() => setIsLogin(false)}>Create account now</button></p>
          </>
        ) : (
          <>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit">Register</button>
            </form>
            <p>Already have an account? <button onClick={() => setIsLogin(true)}>Login here</button></p>
          </>
        )}
      </div>

      <div>
        <h2>Login with OAuth</h2>
        <button onClick={handleGoogleLogin}>Login with Google</button>
        <button onClick={handleGitHubLogin}>Login with GitHub</button>
      </div>
    </div>
  );
};

export default Login;