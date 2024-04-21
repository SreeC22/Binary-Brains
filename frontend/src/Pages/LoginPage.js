import {
  Box, Button, Divider, FormControl, FormErrorMessage, FormLabel, HStack, Input,
  Link, Switch, Text, VStack, useColorModeValue, useToast
} from '@chakra-ui/react';
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
  const [is2FA, setIs2FA] = useState(false); // New state to manage 2FA visibility
  const [token2FA, setToken2FA] = useState(''); // State to hold 2FA token input
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [remember_me, setRememberMe] = useState(false);
  const toast = useToast();
  const bgBox = useColorModeValue('gray.100', 'gray.700');
  const bgVStack = useColorModeValue('white', 'gray.800');

  const isEmailValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password => password.length >= 8;
  const doesPasswordMatch = () => isLogin || (password === confirmPassword);
  const isFormValid = () => isEmailValid(email) && isPasswordValid(password) && doesPasswordMatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (is2FA) {
      handle2FASubmit();
      return;
    }
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
        if (data.requires2FA) { // Check if 2FA is required
          setIs2FA(true);
          toast({
            title: "2FA Required",
            description: "Please enter the 2FA token sent to your email.",
            status: "info",
            duration: 9000,
            isClosable: true,
          });
        } else {
          completeLogin(data);
        }
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

  const handle2FASubmit = async () => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/verify-2fa`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: token2FA }),
      });

      const data = await response.json();

      if (response.ok) {
        completeLogin(data);
      } else {
        toast({
          title: "2FA Verification Failed",
          description: data.message || "Invalid 2FA token.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to verify 2FA, please try again later.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const completeLogin = (data) => {
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
  };

  // Additional UI for entering 2FA token
  if (is2FA) {
    return (
      <VStack as="form" onSubmit={handle2FASubmit} spacing={4} p={8} rounded="lg" bg={bgVStack}>
        <FormControl isRequired>
          <FormLabel>2FA Token</FormLabel>
          <Input
            placeholder="Enter 2FA token"
            value={token2FA}
            onChange={(e) => setToken2FA(e.target.value)}
          />
        </FormControl>
        <Button type="submit" colorScheme="teal">Verify Token</Button>
      </VStack>
    );
  }

  // Regular login/register form
  return (
    <Box display="flex" flexDirection="column" alignItems="center" w="full" p={8} bg={bgBox}>
      <VStack spacing={4} w="full" maxW="md" as="form" onSubmit={handleSubmit} boxShadow="xl" p="6" rounded="lg" bg={bgVStack}>
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
          <FormControl isRequired isInvalid={!doesPasswordMatch() && confirmPassword.length > 0}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              data-testid="confirmPasswordInput" // Add this line for test ID
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
            {!doesPasswordMatch() && confirmPassword.length > 0 && <FormErrorMessage>Passwords must match.</FormErrorMessage>}
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

        </HStack>
      </VStack>
      {isLogin && (
        <Link color="teal.500" mt="4" onClick={() => setIsLogin(false)}>Not registered? Create account now</Link>
      )}
    </Box>
  );
};

export default LoginPage;