import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Text, Button, CircularProgress } from '@chakra-ui/react';

const VerifyLogin = () => {
  const { token } = useParams();  // Extract token from the URL
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/verify-token?token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          navigate('/');  // Redirect to homepage or dashboard on successful verification
        } else {
          throw new Error(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        navigate('/', { state: { error: error.message }});  // Optionally pass error details
      }
    };

    verifyToken();
  }, [navigate, token]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <CircularProgress isIndeterminate color="green.300" />
      <Text mt="8">Verifying your login...</Text>
    </Box>
  );
};

export default VerifyLogin;
