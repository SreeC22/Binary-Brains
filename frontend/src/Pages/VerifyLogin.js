import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Text, CircularProgress } from '@chakra-ui/react';

const VerifyLogin = () => {
    const { token } = useParams();  // Extract token from the URL
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // Sending the JWT in an Authorization header
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/verify_2fa`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`  // Authorization header is typically used to send tokens                    
                    }                    
                });

                const data = await response.json();

                if (response.ok) {
                    navigate('/');  // Redirect to dashboard on successful verification
                } else {
                    throw new Error(data.message || 'Verification failed');
                }
            } catch (error) {
                console.error('Verification error:', error);
                navigate('/login', { state: { error: error.message } });  // Redirect to login on error with optional error message
            }
        };

        // Execute the verification if the token exists
        if (token) {
            verifyToken();
        } else {
            navigate('/login', { state: { error: 'No token provided' } });  // Redirect if no token is found
        }
    }, [navigate, token]);  // Depend on navigate and token to re-run effect if they change

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <CircularProgress isIndeterminate color="green.300" />
            <Text mt="8">Verifying your login...</Text>
        </Box>
    );
};

export default VerifyLogin;
