import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from '@chakra-ui/react';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const { token } = useParams();


  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_BACKEND_URL}/reset-password`;

    // console.log("Token:", token); 
    // console.log("New Password:", newPassword); 
  
    if (!token) {
      console.error("Token is null or undefined.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token, 
          new_password: newPassword 
        }),
      });

      if (response.ok) {
        toast({
          title: 'Password Reset Successful',
          description: 'You can now log in with your new password.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      } else {
        throw new Error('Failed to reset password.');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
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
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" size="lg" fontSize="md">
            Reset Password
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ResetPasswordPage;
