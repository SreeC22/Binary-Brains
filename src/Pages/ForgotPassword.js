import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
//missing smpt config
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_BACKEND_URL}/request-password-reset`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: 'Reset Link Sent',
          description: 'Check your email for the password reset link.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      } else {
        throw new Error('Something went wrong!');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset link. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box my={8} textAlign="center">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" size="lg" fontSize="md">
            Send Reset Link
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ForgotPassword;
