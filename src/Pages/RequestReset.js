import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, useToast, VStack } from '@chakra-ui/react';

const RequestReset = () => {
  const [email, setEmail] = useState('');
  const toast = useToast();

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
          title: 'Request Successful',
          description: 'If an account exists for this email, you will receive reset instructions.',
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request password reset. Please try again.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Box mt={10} mx="auto" width="full" maxW="md">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full">
            Send Reset Link
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default RequestReset;
