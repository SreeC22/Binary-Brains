import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Link,
  Switch,
  Text,
  VStack,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [remember_me, setRememberMe] = useState(false);
  const toast = useToast();

  const isEmailValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password => password.length >= 8; // Example validation
  const doesPasswordMatch = () => isLogin || (password === confirmPassword);
  const isFormValid = () => isEmailValid(email) && isPasswordValid(password) && doesPasswordMatch();
  
  
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
      ...(isLogin ? {} : { username: name }),
      remember_me, 
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (remember_me) {
          localStorage.setItem('token', data.token);
        } else {
          sessionStorage.setItem('token', data.token);
        }
        setUser(data.user);
        toast({
          title: "Login successful.",
          description: "You have successfully logged in.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
      } else if (response.status === 409) {
        toast({
          title: "Account exists.",
          description: "An account with this email already exists. Please login.",
          status: "warning",
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Authentication failed.",
          description: data.message || "Please check your credentials.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to login, please try again later.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Box display="flex" flexDirection="column" alignItems="center" w="full" p={8} bg={useColorModeValue('gray.100', 'gray.700')}>
      <VStack spacing={4} w="full" maxW="md" as="form" onSubmit={handleSubmit} boxShadow="xl" p="6" rounded="lg" bg={useColorModeValue('white', 'gray.800')}>
        <Text fontSize="2xl" fontWeight="bold">{isLogin ? 'Login' : 'Register'}</Text>
        {!isLogin && (
          <FormControl id="name" isRequired>
            <FormLabel>Name</FormLabel>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
        )}
        <FormControl id="email" isRequired isInvalid={!isEmailValid(email) && email.length > 0}>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {!isEmailValid(email) && email.length > 0 && <FormErrorMessage>Email is invalid.</FormErrorMessage>}
        </FormControl>
        <FormControl id="password" isRequired isInvalid={!isPasswordValid(password) && password.length > 0}>
        <FormLabel>Password</FormLabel>
        <Text align="center" mt="4">

</Text>
<Input
  data-testid="passwordInput" // Add this line for test ID
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Your password"
/>
{!isPasswordValid(password) && password.length > 0 && <FormErrorMessage>Password must be at least 8 characters.</FormErrorMessage>}
</FormControl>
{isLogin && (
    <ChakraLink color="teal.500" onClick={() => navigate('/forgot-password')}>
      Forgot password?
    </ChakraLink>
  )}
{!isLogin && (
  <FormControl isRequired isInvalid={!doesPasswordMatch() && confirmPassword.length > 0}> {/* Make sure to check confirmPassword.length to avoid invalid error before user types */}
    <FormLabel>Confirm Password</FormLabel>
    <Input
      data-testid="confirmPasswordInput" // Add this line for test ID
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="Confirm your password"
    />
    {!doesPasswordMatch() && confirmPassword.length > 0 && <FormErrorMessage>Passwords must match.</FormErrorMessage>} {/* Updated condition */}
  </FormControl>
)}


        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="remember-me" mb="0">
            Remember Me
          </FormLabel>
          <Switch id="remember-me" isChecked={remember_me} onChange={(e) => setRememberMe(e.target.checked)} />
        </FormControl>
        <Button type="submit" colorScheme="teal" w="full" isDisabled={!isFormValid()}>{isLogin ? 'Login' : 'Register'}</Button>
        <Button mt="4" w="full" variant="outline" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Register' : 'Login'}</Button>
      </VStack>
      <Divider my="6" />
      <VStack spacing="4">
        <Text>Or login with</Text>
        <HStack spacing="4">
          <Button onClick={handleGoogleLogin} colorScheme="red">Google</Button>
          <Button onClick={handleGitHubLogin} colorScheme="blue">GitHub</Button>
        </HStack>
      </VStack>
      {isLogin && (
        <Link color="teal.500" mt="4" onClick={() => setIsLogin(false)}>Not registered? Create account now</Link>
      )}
    </Box>
  );
};

export default LoginPage;
