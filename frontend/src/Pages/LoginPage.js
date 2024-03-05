import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext'; // Adjust the path as necessary
import {
  Box, Text, Button, VStack, Input, FormControl, FormLabel,
  useColorModeValue, Switch, Divider, HStack, Link
} from '@chakra-ui/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useAuth();

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
    const scope = "read:user user:email";
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&state=${state}`;
    window.location.href = authUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_BACKEND_URL}${isLogin ? '/login' : '/register'}`;
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

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Authentication failed: ${errorData.message}`);
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" w="full" p={{ base: "6", md: "8", lg: "28" }} gap={{ base: "6", md: "8", lg: "20" }} bg={useColorModeValue('#fbf2e3', 'white')}>
      <VStack spacing={4} w="full" maxW="md" p={8} boxShadow="lg" as="form" onSubmit={handleSubmit}>
        <Text fontSize="2xl" fontWeight="bold">{isLogin ? 'Login' : 'Register'}</Text>
        {!isLogin && (
          <FormControl id="name" isRequired>
            <FormLabel>Name</FormLabel>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
        )}
        <FormControl id="email" isRequired>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button type="submit" colorScheme="teal" w="full">{isLogin ? 'Login' : 'Register'}</Button>
        <Switch isChecked={!isLogin} onChange={() => setIsLogin(!isLogin)} mt="4">Switch to {isLogin ? 'Register' : 'Login'}</Switch>
      </VStack>
      <Divider my="6" />
      <VStack spacing="4">
        <Text>Or login with</Text>
        <HStack spacing="4">
          <Button onClick={handleGoogleLogin} colorScheme="red">Login with Google</Button>
          <Button onClick={handleGitHubLogin} colorScheme="blue">Login with GitHub</Button>
        </HStack>
      </VStack>
      {isLogin && (
        <Link color="teal.500" mt="4" onClick={() => setIsLogin(false)}>Not registered? Create account now</Link>
      )}
    </Box>
  );
};

export default LoginPage;
