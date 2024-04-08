import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

const ContactUs = () => {
    return (
        <>
        <Box
            display="flex" flexDirection="column" alignItems="center" w="full" p={{ base: "6", md: "8", lg: "28" }} gap={{ base: "6", md: "8", lg: "20" }} bg={useColorModeValue('gray.100', 'gray.900')} 
          >
            <Text fontSize="5xl" fontWeight="bold" mb="4">
              CONTACT OUR AMAZING TEAM 
            </Text>

            <Text textAlign="center" mb="8">
                CONTACT OUR AMAZING TEAM 
            </Text>
            </Box></>
    );
};

export default ContactUs;
