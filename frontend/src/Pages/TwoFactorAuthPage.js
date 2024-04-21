import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, useToast
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';

const TwoFactorAuthPage = () => {
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || { email: '' }; // Safely accessing state
  const toast = useToast();

  const handleSubmit = async () => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/verify-2fa`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "2FA Verification Successful",
          description: "You are now logged in.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate('/'); // Navigate to the homepage or dashboard
      } else {
        toast({
          title: "2FA Verification Failed",
          description: data.message || "Invalid 2FA token.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to verify 2FA, please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <FormControl>
        <FormLabel>Enter 2FA Token</FormLabel>
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your 2FA code"
        />
        <Button mt={4} onClick={handleSubmit} colorScheme="blue">
          Verify
        </Button>
      </FormControl>
    </Box>
  );
};

export default TwoFactorAuthPage;
