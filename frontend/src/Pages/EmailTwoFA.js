import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const EmailSentConfirmation = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Text fontSize="2xl" mb="4">Email has been successfully sent!</Text>
      <Text mb="8">Please check your inbox to proceed with the next steps.</Text>
      <Button colorScheme="teal" onClick={() => navigate('/login')}>Back to Login</Button>
    </Box>
  );
};

export default EmailSentConfirmation;
